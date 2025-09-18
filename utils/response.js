function success(res, data, message = "Success") {
    return res.json({ status: "success", message, data });
}

function error(res, message = "Error", code = 500) {
    return res.status(code).json({ status: "error", message });
}

module.exports = { success, error };
