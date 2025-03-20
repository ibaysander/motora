import xlsx from 'xlsx';
import { Sequelize, Model, DataTypes } from 'sequelize';
import path from 'path';

// Database configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: false
});

// Define models
interface CategoryAttributes {
  id?: number;
  name: string;
}

interface BrandAttributes {
  id?: number;
  name: string;
}

interface ProductAttributes {
  id?: number;
  categoryId: number;
  brandId: number;
  tipeMotor: string | null;
  tipeSize: string | null;
  hargaBeli: number | null;
  hargaJual: number | null;
  note: string | null;
  currentStock: number;
  minThreshold: number;
}

const Category = sequelize.define<Model<CategoryAttributes>>('Category', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const Brand = sequelize.define<Model<BrandAttributes>>('Brand', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

const Product = sequelize.define<Model<ProductAttributes>>('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Categories',
      key: 'id'
    }
  },
  brandId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Brands',
      key: 'id'
    }
  },
  tipeMotor: {
    type: DataTypes.STRING,
    allowNull: true
  },
  tipeSize: {
    type: DataTypes.STRING,
    allowNull: true
  },
  hargaBeli: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  hargaJual: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  note: {
    type: DataTypes.STRING,
    allowNull: true
  },
  currentStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  minThreshold: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
});

async function importExcelData(filePath: string) {
  try {
    // Read Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet);

    let currentCategory: string | null = null;
    let currentBrand: string | null = null;
    const categoryMap = new Map<string, number>();
    const brandMap = new Map<string, number>();

    // Process each row
    for (const row of data) {
      const rowData = row as any;
      
      // Update current category if present
      if (rowData['NAMA PRODUK']) {
        currentCategory = rowData['NAMA PRODUK'].trim();
      }

      // Update current brand if present
      if (rowData['MEREK']) {
        currentBrand = rowData['MEREK'].trim();
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
      const tipeMotor = rowData['TIPE MOTOR'] ? String(rowData['TIPE MOTOR']).trim() : null;
      const tipeSize = rowData['TIPE / SIZE'] ? String(rowData['TIPE / SIZE']).trim() : null;
      const hargaBeli = rowData['BELI'] ? Number(rowData['BELI']) : null;
      const hargaJual = rowData['JUAL'] ? Number(rowData['JUAL']) : null;
      const note = rowData['NOTE'] ? String(rowData['NOTE']).trim() : null;

      await Product.create({
        categoryId: categoryMap.get(currentCategory)!,
        brandId: brandMap.get(currentBrand)!,
        tipeMotor,
        tipeSize,
        hargaBeli,
        hargaJual,
        note,
        currentStock: 0, // Default value, adjust as needed
        minThreshold: 0 // Default value, adjust as needed
      });
    }

    console.log('Data import completed successfully');
  } catch (error) {
    console.error('Error importing data:', error);
  } finally {
    await sequelize.close();
  }
}

// Usage
const excelFilePath = process.argv[2];
if (!excelFilePath) {
  console.error('Please provide the path to the Excel file');
  process.exit(1);
}

importExcelData(excelFilePath); 