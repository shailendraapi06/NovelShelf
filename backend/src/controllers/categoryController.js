const { Categories, Books } = require('../services/store');

exports.getCategories = async (req, res) => {
  try {
    const categories = await Categories.find();
    const books = await Books.find({ status: 'published' });

    // Compute live book counts for each category
    const categoriesWithCounts = categories.map(cat => {
      const count = books.filter(b => 
        (b.category && b.category.toLowerCase() === cat.name.toLowerCase()) ||
        (b.category && b.category.toLowerCase() === cat.slug.toLowerCase()) ||
        (b.genre && b.genre.toLowerCase().includes(cat.name.toLowerCase()))
      ).length;
      return {
        ...cat,
        bookCount: count
      };
    });

    res.json({
      success: true,
      categories: categoriesWithCounts
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

