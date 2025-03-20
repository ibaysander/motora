import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './config/initDb';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import brandRoutes from './routes/brands';
import multer from 'multer';
import xlsx from 'xlsx';
import { Product, Category, Brand } from './models/index';
import { Model, InferAttributes, InferCreationAttributes } from 'sequelize';
import path from 'path';

interface ProductWithAssociations extends Model<InferAttributes<ProductWithAssociations>, InferCreationAttributes<ProductWithAssociations>> {
  id: number;
  categoryId: number;
  brandId: number;
  tipeMotor: string | null;
  tipeSize: string | null;
  hargaBeli: number | null;
  hargaJual: number | null;
  note: string | null;
  currentStock: number;
  minThreshold: number;
  category?: {
    name: string;
  };
  brand?: {
    name: string;
  };
}

const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, 'import-' + Date.now() + '.xlsx');
  }
});

const upload = multer({ storage: storage });

// Ensure uploads directory exists
import fs from 'fs';
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', productRoutes);
app.use('/api', categoryRoutes);
app.use('/api', brandRoutes);

// Import Excel endpoint
app.post('/api/import-excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    let currentCategory: string | null = null;
    let currentBrand: string | null = null;
    const categoryMap = new Map<string, number>();
    const brandMap = new Map<string, number>();

    // Process each row
    for (const row of data as any[]) {
      // Update current category if present
      if (row['NAMA PRODUK']) {
        currentCategory = row['NAMA PRODUK'].trim();
      }

      // Update current brand if present
      if (row['MEREK']) {
        currentBrand = row['MEREK'].trim();
      }

      // Skip rows without essential data
      if (!currentCategory || !currentBrand) continue;

      // Create or get category
      if (!categoryMap.has(currentCategory)) {
        const [category] = await Category.findOrCreate({
          where: { name: currentCategory }
        });
        categoryMap.set(currentCategory, category.get('id') as number);
      }

      // Create or get brand
      if (!brandMap.has(currentBrand)) {
        const [brand] = await Brand.findOrCreate({
          where: { name: currentBrand }
        });
        brandMap.set(currentBrand, brand.get('id') as number);
      }

      // Create product
      const tipeMotor = row['TIPE MOTOR'] ? String(row['TIPE MOTOR']).trim() : null;
      const tipeSize = row['TIPE / SIZE'] ? String(row['TIPE / SIZE']).trim() : null;
      const hargaBeli = row['BELI'] ? Number(row['BELI']) : null;
      const hargaJual = row['JUAL'] ? Number(row['JUAL']) : null;
      const note = row['NOTE'] ? String(row['NOTE']).trim() : null;

      await Product.create({
        categoryId: categoryMap.get(currentCategory)!,
        brandId: brandMap.get(currentBrand)!,
        tipeMotor,
        tipeSize,
        hargaBeli,
        hargaJual,
        note,
        currentStock: 0,
        minThreshold: 0
      });
    }

    // Delete the uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ message: 'Data imported successfully' });
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ error: 'Failed to import data' });
  }
});

// Export Excel endpoint
app.get('/api/export-excel', async (req, res) => {
  try {
    // Fetch all data with proper typing
    const products = await Product.findAll({
      include: [
        { model: Category, as: 'category' },
        { model: Brand, as: 'brand' }
      ]
    }) as unknown as ProductWithAssociations[];

    // Transform data for Excel with proper type handling
    const excelData = products.map(product => {
      const productData = product.get({ plain: true });
      return {
        'NAMA PRODUK': productData.category?.name || '',
        'MEREK': productData.brand?.name || '',
        'TIPE MOTOR': productData.tipeMotor || '',
        'TIPE / SIZE': productData.tipeSize || '',
        'BELI': productData.hargaBeli || 0,
        'JUAL': productData.hargaJual || 0,
        'STOCK': productData.currentStock || 0,
        'MIN STOCK': productData.minThreshold || 0,
        'NOTE': productData.note || ''
      };
    });

    // Create workbook
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(excelData);

    // Add worksheet to workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Products');

    // Generate Excel file
    const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');

    res.send(excelBuffer);
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
