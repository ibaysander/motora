import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './config/initDb';
import productRoutes from './routes/products';
import categoryRoutes from './routes/categories';
import brandRoutes from './routes/brands';
import motorcycleRoutes from './routes/motorcycles';
import multer from 'multer';
import xlsx from 'xlsx';
import { Product, Category, Brand, Motorcycle } from './models';
import { Model, InferAttributes, InferCreationAttributes } from 'sequelize';
import path from 'path';

interface ProductWithAssociations extends Model<InferAttributes<ProductWithAssociations>, InferCreationAttributes<ProductWithAssociations>> {
  id: number;
  categoryId: number;
  brandId: number;
  motorcycleId: number | null;
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
  motorcycle?: {
    manufacturer: string;
    model: string | null;
  };
}

const app = express();
const PORT = process.env.PORT || 3001;

// Configure CORS
app.use(cors({
  origin: true, // Allow all origins in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

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
app.use(express.json());

// Routes
app.use('/api', productRoutes);
app.use('/api', categoryRoutes);
app.use('/api', brandRoutes);
app.use('/api', motorcycleRoutes);

// Import Excel endpoint
app.post('/api/import-excel', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const results: { [key: string]: number } = {};

    // Process each sheet
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const data = xlsx.utils.sheet_to_json(worksheet);
      let importedCount = 0;

      let currentCategory: string | null = null;
      let currentBrand: string | null = null;
      const categoryMap = new Map<string, number>();
      const brandMap = new Map<string, number>();
      const motorcycleMap = new Map<string, number>();

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

        try {
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

          // Extract motorcycle manufacturer and model from TIPE MOTOR
          let motorcycleId = null;
          
          if (row['TIPE MOTOR']) {
            const tipeMotor = String(row['TIPE MOTOR']).trim();
            const parts = tipeMotor.split(' ');
            
            let manufacturer = '';
            let model = null;
            
            if (parts.length >= 2) {
              manufacturer = parts[0];
              model = parts.slice(1).join(' ');
            } else {
              manufacturer = tipeMotor;
            }
            
            const motorcycleKey = `${manufacturer}-${model || ''}`;
            
            if (!motorcycleMap.has(motorcycleKey)) {
              const [motorcycle] = await Motorcycle.findOrCreate({
                where: { manufacturer, model },
                defaults: { manufacturer, model }
              });
              motorcycleMap.set(motorcycleKey, motorcycle.get('id') as number);
            }
            
            motorcycleId = motorcycleMap.get(motorcycleKey) || null;
          }

          const tipeSize = row['TIPE / SIZE'] ? String(row['TIPE / SIZE']).trim() : null;
          const hargaBeli = row['BELI'] ? Number(row['BELI']) : null;
          const hargaJual = row['JUAL'] ? Number(row['JUAL']) : null;
          const note = row['NOTE'] ? String(row['NOTE']).trim() : null;

          await Product.create({
            categoryId: categoryMap.get(currentCategory)!,
            brandId: brandMap.get(currentBrand)!,
            motorcycleId,
            tipeSize,
            hargaBeli,
            hargaJual,
            note,
            currentStock: 0,
            minThreshold: 0
          });
          importedCount++;
        } catch (error) {
          console.error(`Error importing row in sheet ${sheetName}:`, error);
        }
      }

      results[sheetName] = importedCount;
    }

    // Delete the uploaded file
    fs.unlinkSync(req.file.path);

    res.json({ 
      message: 'Data imported successfully',
      results
    });
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ error: 'Failed to import data' });
  }
});

// Export Excel endpoint
app.get('/api/export-excel', async (req, res) => {
  try {
    // Create workbook
    const workbook = xlsx.utils.book_new();

    // Export Products sheet
    const products = await Product.findAll({
      include: [
        { model: Category, as: 'category' },
        { model: Brand, as: 'brand' },
        { model: Motorcycle, as: 'motorcycle' }
      ]
    }) as unknown as ProductWithAssociations[];

    const productsData = products.map(product => {
      const productData = product.get({ plain: true });
      
      // Create tipeMotor for backward compatibility
      const tipeMotor = product.motorcycle ? 
        [product.motorcycle.manufacturer, product.motorcycle.model]
          .filter(Boolean)
          .join(' ') : '';
      
      return {
        'NAMA PRODUK': productData.category?.name || '',
        'MEREK': productData.brand?.name || '',
        'MANUFACTURER': product.motorcycle?.manufacturer || '',
        'MODEL': product.motorcycle?.model || '',
        'TIPE MOTOR': tipeMotor, // Combined for backward compatibility
        'TIPE / SIZE': productData.tipeSize || '',
        'BELI': productData.hargaBeli || 0,
        'JUAL': productData.hargaJual || 0,
        'STOCK': productData.currentStock || 0,
        'MIN STOCK': productData.minThreshold || 0,
        'NOTE': productData.note || ''
      };
    });

    const productsWorksheet = xlsx.utils.json_to_sheet(productsData);
    xlsx.utils.book_append_sheet(workbook, productsWorksheet, 'Products');

    // Export Categories sheet
    const categories = await Category.findAll();
    const categoriesData = categories.map(category => ({
      'ID': category.get('id'),
      'NAMA KATEGORI': category.get('name')
    }));
    const categoriesWorksheet = xlsx.utils.json_to_sheet(categoriesData);
    xlsx.utils.book_append_sheet(workbook, categoriesWorksheet, 'Categories');

    // Export Brands sheet
    const brands = await Brand.findAll();
    const brandsData = brands.map(brand => ({
      'ID': brand.get('id'),
      'NAMA MEREK': brand.get('name')
    }));
    const brandsWorksheet = xlsx.utils.json_to_sheet(brandsData);
    xlsx.utils.book_append_sheet(workbook, brandsWorksheet, 'Brands');

    // Generate Excel file
    const excelBuffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set headers for file download
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=inventory_data.xlsx');

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
