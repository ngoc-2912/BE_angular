const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET;

class UserController {
  static async get(req, res) {
    try {
      const users = await User.findAll({
        attributes: { exclude: ["password"] },
      });

      return res.status(200).json({
        status: 200,
        message: "Lấy danh sách thành công",
        data: users,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Lỗi server", error: error.message });
    }
  }

  static async getById(req, res) {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        return res.status(404).json({ message: "Id không tồn tại" });
      }

      return res.status(200).json({
        status: 200,
        data: user,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Lỗi server", error: error.message });
    }
  }

  static async updateActive(req, res) {
    try {
      const { id } = req.params;
      const { active } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ message: "Id không tồn tại" });
      }

      if (active === undefined || active === null) {
        return res.status(400).json({ message: "Active không được để trống" });
      }

      if (![0, 1, "0", "1"].includes(active)) {
        return res.status(400).json({ message: "Active chỉ nhận 0 hoặc 1" });
      }

      user.active = String(active);
      await user.save();

      const updatedUser = await User.findByPk(id, {
        attributes: { exclude: ["password"] },
      });

      return res.status(200).json({
        message: "Cập nhật active thành công",
        user: updatedUser,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Lỗi server", error: error.message });
    }
  }

  static async register(req, res) {
    try {
      const { full_name, email, password } = req.body;
      console.log(req.body);

      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ message: "Email đã tồn tại!" });
      }

      const user = await User.create({ full_name, email, password });

      res.status(201).json({
        message: "Đăng ký thành công!",
        user: { id: user.id, full_name: user.full_name, email: user.email },
      });
    } catch (error) {
      res.status(500).json({ message: "Lỗi server", error: error.message });
    }
  }

static async registerAdmin(req, res) {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin!",
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        message: "Email đã tồn tại!",
      });
    }

    // ❗ KHÔNG HASH Ở ĐÂY
    // model sẽ tự hash

    const user = await User.create({
      full_name,
      email,
      password,   // <-- truyền thẳng
      role: "1",  // enum phải là string
      active: "1",
    });

    res.status(201).json({
      message: "Tạo tài khoản admin thành công!",
      user: {
        id: user.id,
        email: user.email,
      },
    });

  } catch (error) {
    res.status(500).json({
      message: "Lỗi server",
      error: error.message,
    });
  }
}

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // kiểm tra thiếu dữ liệu
      if (!email || !password) {
        return res.status(400).json({
          messageAlert: "Vui lòng nhập đầy đủ email và mật khẩu!",
        });
      }

      const user = await User.findOne({ where: { email } });

      // sai email
      if (!user) {
        return res.status(400).json({
          messageAlert: "Email hoặc mật khẩu không chính xác!",
        });
      }

      // tài khoản bị khóa
      if (user.active === "0") {
        return res.status(403).json({
          messageAlert: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ admin!",
        });
      }

      // sai mật khẩu
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({
          messageAlert: "Email hoặc mật khẩu không chính xác!",
        });
      }

      // tạo token
      const token = jwt.sign(
        {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: "1h" },
      );

      // login thành công
      return res.status(200).json({
        messageAlert: "Đăng nhập thành công!",
        token,
      });
    } catch (error) {
      console.error("Lỗi server:", error);
      return res.status(500).json({
        messageAlert: "Lỗi server, vui lòng thử lại!",
      });
    }
  }
}

module.exports = UserController;
