const bcrypt = require("bcryptjs");
const { prisma } = require("../config/db");
const { asyncHandler } = require("../middleware/errorHandler");
const { deleteFile } = require("../middleware/upload");
const path = require("path");
const fs = require('fs');



const showLogin = asyncHandler(async (req, res) => {
  await res.render("admin/login", {
    title: "Admin Login",
    layout: "layouts/auth",
    currentYear: new Date().getFullYear(),
  });
});
const createAdminUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) {
    req.flash("error", "All fields are required");
    res.status(401).json({
      success: true,
      message: "All fields are required",
      data: null,
    });
    return;
  }
  // Check existing user
  const exists = await prisma.adminUser.findFirst({
    where: {
      OR: [{ username }, { email }],
    },
  });
  if (exists) {
    req.flash("error", "Username or email already exists");
    res.status(401).json({
      success: true,
      message: "Username or email already exists",
      data: null,
    });
    return;
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.adminUser.create({
    data: {
      username,
      email,
      password: hashedPassword,
      role: role || "moderator",
    },
  });
  req.flash("success", "Admin user created successfully");
  res.status(200).json({
    success: true,
    message: "Admin user created successfully",
    data: null,
  });
});
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
  res.redirect("/admin/admissions");
});
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
const listAdmissions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const status = req.query.status;
  const search = req.query.search;
    const courseType = (req.query.courseType || 'BBA').toUpperCase();
  const model = courseType === 'MBA' ? prisma.mbaApplication : prisma.bbaApplication;

  const where = {};
  if (status) where.status = status; // No .toUpperCase() if your defaults are lowercase "pending"
  
  if (search) {
    if (courseType === 'MBA') {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { mobileNumber: { contains: search } },
      ];
    } else {
      // BBA uses 'fullName'
      where.OR = [
        { fullName: { contains: search } },
        { email: { contains: search } },
        { mobileNumber: { contains: search } },
      ];
    }
  }
  const [admissions, total] = await Promise.all([
    model.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        student: {
          select: {
            applicationNo: true,
            email: true
          }
        }
      }
    }),
    model.count({ where }),
  ]);
  const totalPages = Math.ceil(total / limit);
  res.render("admin/admissions/list", {
    layout: "layouts/main",
    isAuthenticated: true,
    courseType, // Pass this to view to change table headers
    admissions,
    currentPage: page,
    totalPages,
    total,
    filters: { status, search, courseType },
  });
});
const viewAdmission = asyncHandler(async (req, res) => {
  const { courseType, id } = req.params;

  // 1. Determine which table to query
  const model = courseType.toLowerCase() === 'mba' 
    ? prisma.mbaApplication 
    : prisma.bbaApplication;

  // 2. Fetch the record and include the core Student data
  const admission = await model.findUnique({
    where: { id: parseInt(id) },
    include: {
      student: {
        select: {
          applicationNo: true,
          email: true,
          fullName: true
        }
      }
    }
  });

  // 3. Handle 404
  if (!admission) {
    req.flash("error", "Admission record not found.");
    return res.redirect(`/admin/admissions?courseType=${courseType.toUpperCase()}`);
  }

  // 4. Handle JSON Parsing for MBA
  // Because MBA stores academic and work rows as strings in MySQL
  if (courseType.toLowerCase() === 'mba') {
    if (admission.academicRows) {
      try {
        admission.academicRows = JSON.parse(admission.academicRows);
      } catch (e) {
        admission.academicRows = []; 
      }
    }
    if (admission.workExperienceRows) {
      try {
        admission.workExperienceRows = JSON.parse(admission.workExperienceRows);
      } catch (e) {
        admission.workExperienceRows = [];
      }
    }
  }

  // 5. Render the view
  res.render("admin/admissions/view", {
    layout: "layouts/main",
    isAuthenticated: true,
    admission,
    courseType: courseType.toUpperCase(),
  });
});

const editAdmissionForm = asyncHandler(async (req, res) => {
  const { courseType, id } = req.params;
  const appId = parseInt(id);

  // 1. Identify the correct model
  const model = courseType.toLowerCase() === 'mba' 
    ? prisma.mbaApplication 
    : prisma.bbaApplication;

  // 2. Fetch the admission record
  const admission = await model.findUnique({
    where: { id: appId },
    include: {
      student: {
        select: {
          applicationNo: true,
          email: true
        }
      }
    }
  });

  // 3. Handle 404
  if (!admission) {
    req.flash("error", "Admission record not found");
    return res.redirect(`/admin/admissions?courseType=${courseType.toUpperCase()}`);
  }

  // 4. Data Preparation for the Edit Form
  // MBA uses JSON strings for arrays; BBA uses flat fields
  if (courseType.toLowerCase() === 'mba') {
    try {
      admission.academicRows = admission.academicRows ? JSON.parse(admission.academicRows) : [];
      admission.workExperienceRows = admission.workExperienceRows ? JSON.parse(admission.workExperienceRows) : [];
      admission.qualifyingExams = admission.qualifyingExams ? JSON.parse(admission.qualifyingExams) : [];
    } catch (e) {
      console.error("JSON Parsing Error for Edit Form:", e);
    }
  }

  // 5. Render the edit view
  // You can use a single edit file or separate ones (admin/admissions/edit-mba.ejs)
  res.render("admin/admissions/edit", {
    layout: "layouts/main",
    isAuthenticated: true,
    admission,
    courseType: courseType.toUpperCase()
  });
});

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

const deleteAdmission = asyncHandler(async (req, res) => {
  const { courseType, id } = req.params;
  const appId = parseInt(id);
  const model = courseType.toLowerCase() === 'mba' 
    ? prisma.mbaApplication 
    : prisma.bbaApplication;

  const admission = await model.findUnique({
    where: { id: appId },
  });

  if (!admission) {
    req.flash("error", "Admission record not found");
    return res.redirect(`/admin/admissions?courseType=${courseType.toUpperCase()}`);
  }
  const fileFields = [
    'photoUrl', 
    'signatureUrl', 
    'marksheet10Url', 
    'marksheet12Url', 
    'marksheetGradUrl', 
    'casteCertificateUrl'
  ];

  fileFields.forEach(field => {
    const filePath = admission[field];
    if (filePath) {
      const fullPath = path.join(process.cwd(), filePath);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (err) {
          console.error(`Failed to delete file: ${fullPath}`, err);
        }
      }
    }
  });
  await model.delete({ where: { id: appId } });
  req.flash("success", "Admission and associated files deleted successfully");
  res.redirect(`/admin/admissions?courseType=${courseType.toUpperCase()}`);
});

const updateStatus = asyncHandler(async (req, res) => {
  const { courseType, id } = req.params; 
  const { status, admin_notes } = req.body;

  const model = courseType.toLowerCase() === 'mba' 
    ? prisma.mbaApplication 
    : prisma.bbaApplication;

  await model.update({
    where: { id: parseInt(id) },
    data: {
      status: status.toLowerCase(), 
      // adminNotes: admin_notes || null, // Uncomment if added to Prisma
    },
  });

  req.flash("success", `Application marked as ${status} successfully`);
  res.redirect(`/admin/admissions/${courseType.toLowerCase()}/${id}`);
});




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
const createGalleryForm = asyncHandler(async (req, res) => {
  res.render("admin/gallery/create", {
    layout: "layouts/main",
    isAuthenticated: true,
  });
});
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





const listFaculty = asyncHandler(async (req, res) => {
  const faculty = await prisma.faculty.findMany({
    orderBy: { id: "asc" },
  });

  res.render("admin/faculty/list", {
    layout: "layouts/main",
    isAuthenticated: true,
    faculty,
    currentPath: req.path,
  });
});

// @desc    Show create form
// @route   GET /admin/faculty/create
const createFacultyForm = asyncHandler(async (req, res) => {
  res.render("admin/faculty/edit", {
    layout: "layouts/main",
    isAuthenticated: true,
    currentPath: req.path,
  });
});

// @desc    Store new faculty member
// @route   POST /admin/faculty/store
const createFaculty = asyncHandler(async (req, res) => {
  if (!req.file) {
    req.flash("error", "Profile image is required");
    return res.redirect("/admin/faculty/create");
  }

  const { name, designation, qualification, expertise } = req.body;

  await prisma.faculty.create({
    data: {
      name,
      designation,
      qualification,
      expertise,
      image: `/uploads/faculty/${req.file.filename}`,
    },
  });

  req.flash("success", "Faculty member added successfully");
  res.redirect("/admin/faculty");
});

// @desc    Show edit form
// @route   GET /admin/faculty/edit/:id
const editFacultyForm = asyncHandler(async (req, res) => {
  const member = await prisma.faculty.findUnique({
    where: { id: parseInt(req.params.id) },
  });

  if (!member) {
    req.flash("error", "Faculty member not found");
    return res.redirect("/admin/faculty");
  }

  res.render("admin/faculty/edit", {
    layout: "layouts/main",
    isAuthenticated: true,
    member,
    currentPath: req.path,
  });
});

// @desc    Update faculty member
// @route   POST /admin/faculty/update/:id
const updateFaculty = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const existing = await prisma.faculty.findUnique({
    where: { id },
  });

  if (!existing) {
    req.flash("error", "Faculty member not found");
    return res.redirect("/admin/faculty");
  }

  const { name, designation, qualification, expertise } = req.body;
  const updateData = {
    name,
    designation,
    qualification,
    expertise,
  };

  if (req.file) {
    // Delete old image if it exists and a new one is uploaded
    if (existing.image) {
      deleteFile(path.join(__dirname, "../../public", existing.image));
    }
    updateData.image = `/uploads/faculty/${req.file.filename}`;
  }

  await prisma.faculty.update({
    where: { id },
    data: updateData,
  });

  req.flash("success", "Faculty details updated successfully");
  res.redirect("/admin/faculty");
});

// @desc    Delete faculty member
// @route   DELETE /admin/faculty/delete/:id
const deleteFaculty = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const member = await prisma.faculty.findUnique({
    where: { id },
  });

  if (!member) {
    req.flash("error", "Faculty member not found");
    return res.redirect("/admin/faculty");
  }

  // Remove image from storage
  if (member.image) {
    deleteFile(path.join(__dirname, "../../public", member.image));
  }

  await prisma.faculty.delete({ where: { id } });

  req.flash("success", "Faculty member removed successfully");
  res.redirect("/admin/faculty");
});










module.exports = {
  showLogin,
  createAdminUser,
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

  listFaculty,
  createFacultyForm,
  createFaculty,
  editFacultyForm,
  updateFaculty,
  deleteFaculty,
};
