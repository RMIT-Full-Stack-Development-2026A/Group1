// Tạm thời tạo hàm bù nhìn để server không bị crash. Thắng sẽ viết logic JWT vào đây sau.
export const verifyToken = (req, res, next) => {
    next(); // Cho phép đi tiếp
};