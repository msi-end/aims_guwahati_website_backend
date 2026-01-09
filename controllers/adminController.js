const bcrypt = require("bcryptjs");
const { prisma } = require("../config/db");
const { asyncHandler } = require("../middleware/errorHandler");
const { deleteFile } = require("../middleware/upload");
const path = require("path");

/**
 * Show login page
 */
const showLogin = asyncHandler(async (req, res) => {
  await res.render("admin/login", {
    title: "Admin Login",
    layout: "layouts/auth",
    currentYear: new Date().getFullYear(),
  });
});

/* ===========================
   CREATE ADMIN USER (ONE-TIME / SUPER ADMIN)
=========================== */
const createAdminUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    req.flash("error", "All fields are required");
    return res.redirect("/admin/users/create");
  }

  // Check existing user
  const exists = await prisma.adminUser.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });

  if (exists) {
    req.flash("error", "Username or email already exists");
    return res.redirect("/admin/users/create");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.adminUser.create({
    data: {
      username,
      email,
      password: hashedPassword,
      role: role || "moderator", // enum value
    },
  });

  req.flash("success", "Admin user created successfully");
  res.redirect("/admin/users");
});

/**
 * Handle login
 */

const login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  console.log(username, password);

  if (!username || !password) {
    req.flash("error", "Please provide username and password");
    return res.redirect("/admin/login");
  }

  const admin = await prisma.adminUser.findUnique({
    where: { username },
  });
  console.log("not working:" + admin);
  console.log(await bcrypt.compare(password, admin.password));

  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    req.flash("error", "Invalid credentials");

    return res.redirect("/admin/login");
  }
  req.session.adminId = admin.id;
  req.session.admin = {
    id: admin.id,
    username: admin.username,
    email: admin.email,
    fullName: admin.fullName,
  };
  req.flash("success", "Login successful!");
  res.redirect("/admin/dashboard");
});

/**
 * Handle logout
 */
const logout = asyncHandler(async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
    }
    res.redirect("/admin/login");
  });
});

const showDashboard = asyncHandler(async (req, res) => {
  // =====================
  // BASIC STATS
  // =====================
  const totalAdmissions = await prisma.admission.count();
  const pendingAdmissions = await prisma.admission.count({
    where: { status: "pending" },
  });
  const approvedAdmissions = await prisma.admission.count({
    where: { status: "approved" },
  });
  const rejectedAdmissions = await prisma.admission.count({
    where: { status: "rejected" },
  });
  const totalGallery = await prisma.gallery.count();
  // ====================
  // RECENT ADMISSIONS
  // =====================
  const recentAdmissions = await prisma.admission.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
  });
  // =====================
  // ADMISSIONS BY COURSE
  // =====================
  const admissionsByCourseRaw = await prisma.admission.groupBy({
    by: ["course"],
    _count: {
      course: true,
    },
  });
  // Sort by count DESC in JS (Prisma limitation)
  const admissionsByCourse = admissionsByCourseRaw
    .sort((a, b) => b._count.course - a._count.course)
    .slice(0, 6);
  // =====================
  // ADMISSIONS BY CATEGORY
  // =====================
  const admissionsByCategory = await prisma.admission.groupBy({
    by: ["category"],
    _count: {
      category: true,
    },
  });
  // =====================
  // ADMISSIONS BY MONTH (LAST 6 MONTHS)
  // =====================
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const admissionsByMonth = await prisma.$queryRaw`
    SELECT 
      DATE_FORMAT(createdAt, '%Y-%m') AS month,
      COUNT(*) AS count
    FROM admissions
    WHERE createdAt >= ${sixMonthsAgo}
    GROUP BY month
    ORDER BY month ASC
  `;

  // =====================
  // GALLERY BY CATEGORY
  // =====================
  const galleryByCategory = await prisma.gallery.groupBy({
    by: ["category"],
    _count: {
      category: true,
    },
  });

  // =====================
  // RENDER
  // =====================
  res.render("admin/dashboard", {
    layout: "layouts/main",
    isAuthenticated: true,
    stats: {
      totalAdmissions,
      pendingAdmissions,
      approvedAdmissions,
      rejectedAdmissions,
      totalGallery,
    },
    recentAdmissions,
    admissionsByCourse: admissionsByCourse.map((item) => ({
      course: item.course,
      count: item._count.course,
    })),
    admissionsByCategory: admissionsByCategory.map((item) => ({
      category: item.category,
      count: item._count.category,
    })),
    admissionsByMonth,
    galleryByCategory: galleryByCategory.map((item) => ({
      category: item.category,
      count: item._count.category,
    })),
  });
});

/**
 * List all admissions
 */
const listAdmissions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const status = req.query.status;
  const search = req.query.search;

  const where = {};
  if (status) where.status = status.toUpperCase();
  if (search) {
    where.OR = [
      { studentName: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
    ];
  }

  const [admissions, total] = await Promise.all([
    prisma.admission.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.admission.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  res.render("admin/admissions/list", {
    layout: "layouts/main",
    isAuthenticated: true,
    admissions,
    currentPage: page,
    totalPages,
    total,
    filters: { status, search },
  });
});

/**
 * View single admission
 */
const viewAdmission = asyncHandler(async (req, res) => {
  const admission = await prisma.admission.findUnique({
    where: { id: parseInt(req.params.id) },
  });

  if (!admission) {
    req.flash("error", "Admission not found");
    return res.redirect("/admin/admissions");
  }

  res.render("admin/admissions/view", { admission });
});

/**
 * Show edit admission form
 */
const editAdmissionForm = asyncHandler(async (req, res) => {
  const admission = await prisma.admission.findUnique({
    where: { id: parseInt(req.params.id) },
  });

  if (!admission) {
    req.flash("error", "Admission not found");
    return res.redirect("/admin/admissions");
  }

  res.render("admin/admissions/edit", { admission });
});

/**
 * Update admission
 */
const updateAdmission = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const {
    student_name,
    father_name,
    mother_name,
    date_of_birth,
    gender,
    email,
    phone,
    address,
    previous_school,
    class_applying,
    admin_notes,
    status,
  } = req.body;

  const existing = await prisma.admission.findUnique({
    where: { id },
  });
  if (!existing) {
    req.flash("error", "Admission not found");
    return res.redirect("/admin/admissions");
  }
  const updateData = {
    studentName: student_name,
    fatherName: father_name,
    motherName: mother_name,
    dateOfBirth: new Date(date_of_birth),
    gender: gender.toUpperCase(),
    email: email || null,
    phone,
    address,
    previousSchool: previous_school || null,
    classApplying: class_applying,
    adminNotes: admin_notes || null,
    status: status?.toUpperCase() || existing.status,
  };

  if (req.file) {
    if (existing.passportPhoto) {
      deleteFile(path.join(__dirname, "..", existing.passportPhoto));
    }
    updateData.passportPhoto = `/uploads/passports/${req.file.filename}`;
  }

  await prisma.admission.update({
    where: { id },
    data: updateData,
  });

  req.flash("success", "Admission updated successfully");
  res.redirect(`/admin/admissions/${id}`);
});

/**
 * Delete admission
 */
const deleteAdmission = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);

  const admission = await prisma.admission.findUnique({
    where: { id },
  });

  if (!admission) {
    req.flash("error", "Admission not found");
    return res.redirect("/admin/admissions");
  }

  if (admission.passportPhoto) {
    deleteFile(path.join(__dirname, "..", admission.passportPhoto));
  }

  await prisma.admission.delete({ where: { id } });

  req.flash("success", "Admission deleted successfully");
  res.redirect("/admin/admissions");
});

/**
 * Update admission status
 */
const updateStatus = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const { status, admin_notes } = req.body;

  await prisma.admission.update({
    where: { id },
    data: {
      status: status.toUpperCase(),
      adminNotes: admin_notes || null,
    },
  });

  req.flash("success", "Status updated successfully");
  res.redirect(`/admin/admissions/${id}`);
});

/**
 * List gallery items
 */
/**
 * List Gallery Items
 */
const listGallery = asyncHandler(async (req, res) => {
  const category = req.query.category;
  const where = category ? { category: category.toUpperCase() } : {};
  const galleryItems = await prisma.gallery.findMany({
    where,
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
  });

  const categories = await prisma.gallery.groupBy({
    by: ["category"],
    _count: {
      category: true,
    },
  });

  console.log(galleryItems);

  res.render("admin/gallery/list", {
    layout: "layouts/main",
    isAuthenticated: true,

    galleryItems,

    categories: categories.map((c) => ({
      name: c.category,
      count: c._count.category,
    })),

    currentCategory: category || "all",
    currentPath: req.path, // ✅ for sidebar active state
  });
});

/**
 * Show create gallery form
 */
const createGalleryForm = asyncHandler(async (req, res) => {
  res.render("admin/gallery/create", {
    layout: "layouts/main",
    isAuthenticated: true,
  });
});

/**
 * Create gallery item
 */
const createGallery = asyncHandler(async (req, res) => {
  if (!req.file) {
    req.flash("error", "Image is required");
    return res.redirect("/admin/gallery/create");
  }
  const { title, description, category, display_order } = req.body;
  await prisma.gallery.create({
    data: {
      title,
      description,
      image: `/uploads/gallery/${req.file.filename}`,
      category: category.toLowerCase(),
      displayOrder: Number(display_order) || 0,
      isActive: true,
    },
  });

  req.flash("success", "Gallery item created successfully");
  res.redirect("/admin/gallery");
});

/**
 * Show edit gallery form
 */
const editGalleryForm = asyncHandler(async (req, res) => {
  const item = await prisma.gallery.findUnique({
    where: { id: parseInt(req.params.id) },
  });

  if (!item) {
    req.flash("error", "Gallery item not found");
    return res.redirect("/admin/gallery");
  }

  res.render("admin/gallery/edit", {
    layout: "layouts/main",
    isAuthenticated: true,
    item,
  });
});

/**
 * Update gallery item
 */
const updateGallery = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const existing = await prisma.gallery.findUnique({
    where: { id },
  });

  if (!existing) {
    req.flash("error", "Gallery item not found");
    return res.redirect("/admin/gallery");
  }

  const { title, description, category, is_featured, display_order } = req.body;
  const updateData = {
    title,
    description: description || null,
    category: category?.toUpperCase() || "OTHER",
    isFeatured: is_featured === "on",
    displayOrder: display_order ? parseInt(display_order) : 0,
  };

  if (req.file) {
    if (existing.imageUrl) {
      deleteFile(path.join(__dirname, "..", existing.imageUrl));
    }
    updateData.imageUrl = `/uploads/gallery/${req.file.filename}`;
  }

  await prisma.gallery.update({
    where: { id },
    data: updateData,
  });

  req.flash("success", "Gallery item updated successfully");
  res.redirect("/admin/gallery");
});

/**
 * Delete gallery item
 */
const deleteGallery = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const item = await prisma.gallery.findUnique({
    where: { id },
  });

  if (!item) {
    req.flash("error", "Gallery item not found");
    return res.redirect("/admin/gallery");
  }

  if (item.imageUrl) {
    deleteFile(path.join(__dirname, "..", item.imageUrl));
  }

  await prisma.gallery.delete({ where: { id } });

  req.flash("success", "Gallery item deleted successfully");
  res.redirect("/admin/gallery");
});

/**
 * Update gallery order (AJAX)
 */
const updateGalleryOrder = asyncHandler(async (req, res) => {
  const { items } = req.body;

  await Promise.all(
    items.map((item) =>
      prisma.gallery.update({
        where: { id: parseInt(item.id) },
        data: { displayOrder: parseInt(item.order) },
      })
    )
  );

  res.json({ success: true });
});

module.exports = {
  showLogin,
  login,
  logout,
  showDashboard,
  listAdmissions,
  viewAdmission,
  editAdmissionForm,
  updateAdmission,
  deleteAdmission,
  updateStatus,
  listGallery,
  createGalleryForm,
  createGallery,
  editGalleryForm,
  updateGallery,
  deleteGallery,
  updateGalleryOrder,
};
