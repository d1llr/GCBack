
exports.getCurrentDay = (req, res) => {
    try {
        const now = new Date();

        res.status(200).send(now.toUTCString());
    }
    catch {
        res.status(500).send({ message: err.message });
    };
};



