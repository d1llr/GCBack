
export function getCurrentDay(req, res) {
    try {
        const now = new Date();
        res.status(200).send(now.toUTCString());
    }
    catch {
        res.status(500).send({ message: err.message });
    };
}
export function getCurrentSupply(req, res) {
    try {
        let a = 38302143
        res.status(200).json(a);
    }
    catch {
        res.status(500).send({ message: 'error' });
    };
}



