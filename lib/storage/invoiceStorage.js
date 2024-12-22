const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class InvoiceStorage {
  constructor() {
    // Store in project root /storage/invoices
    this.baseDir = path.join(process.cwd(), 'storage', 'invoices');
    this.initStorage();
  }

  async initStorage() {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
    } catch (error) {
      console.error('Storage initialization failed:', error);
    }
  }

  getStoragePath(invoiceId) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    return path.join(this.baseDir, year.toString(), month);
  }

  async ensureDirectory(filepath) {
    await fs.mkdir(path.dirname(filepath), { recursive: true });
  }

  async saveInvoice(invoiceId, fileBuffer, metadata = {}) {
    try {
      const storagePath = this.getStoragePath(invoiceId);
      const hash = crypto
        .createHash('sha256')
        .update(`${invoiceId}-${Date.now()}`)
        .digest('hex')
        .slice(0, 8);

      const filename = `${invoiceId}-${hash}.pdf`;
      const filepath = path.join(storagePath, filename);

      // Create directory if it doesn't exist
      await this.ensureDirectory(filepath);

      // Save the file
      await fs.writeFile(filepath, fileBuffer);

      // Save metadata
      await fs.writeFile(
        `${filepath}.json`,
        JSON.stringify(
          {
            invoiceId,
            createdAt: new Date().toISOString(),
            filename,
            ...metadata,
          },
          null,
          2
        )
      );

      // Return relative path for database storage
      return {
        path: path.relative(this.baseDir, filepath),
        filename,
      };
    } catch (error) {
      console.error('Failed to save invoice:', error);
      throw new Error('Failed to save invoice file');
    }
  }

  async getInvoice(relativePath) {
    try {
      const fullPath = path.join(this.baseDir, relativePath);
      const fileBuffer = await fs.readFile(fullPath);

      // Try to get metadata if it exists
      let metadata = null;
      try {
        const metadataContent = await fs.readFile(`${fullPath}.json`, 'utf-8');
        metadata = JSON.parse(metadataContent);
      } catch (err) {
        // Metadata file might not exist, ignore error
      }

      return {
        file: fileBuffer,
        metadata,
      };
    } catch (error) {
      console.error('Failed to read invoice:', error);
      throw new Error('Failed to read invoice file');
    }
  }

  async deleteInvoice(relativePath) {
    try {
      const fullPath = path.join(this.baseDir, relativePath);
      await fs.unlink(fullPath);

      // Try to delete metadata if it exists
      try {
        await fs.unlink(`${fullPath}.json`);
      } catch (err) {
        // Metadata file might not exist, ignore error
      }

      return true;
    } catch (error) {
      console.error('Failed to delete invoice:', error);
      throw new Error('Failed to delete invoice file');
    }
  }

  async listInvoices(invoiceId = '') {
    try {
      const files = [];

      // Recursive function to walk through directories
      async function walk(dir) {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);

          if (entry.isDirectory()) {
            await walk(fullPath);
          } else if (
            entry.isFile() &&
            entry.name.endsWith('.pdf') &&
            (!invoiceId || entry.name.includes(invoiceId))
          ) {
            let metadata = null;
            try {
              const metadataContent = await fs.readFile(
                `${fullPath}.json`,
                'utf-8'
              );
              metadata = JSON.parse(metadataContent);
            } catch (err) {}

            files.push({
              path: path.relative(this.baseDir, fullPath),
              filename: entry.name,
              metadata,
            });
          }
        }
      }

      await walk(this.baseDir);
      return files;
    } catch (error) {
      console.error('Failed to list invoices:', error);
      throw new Error('Failed to list invoice files');
    }
  }
}

module.exports = InvoiceStorage;
