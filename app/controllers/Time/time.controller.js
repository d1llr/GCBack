
exports.getCurrentDay = (req, res) => {
    try {
        const now = new Date();

        // get the current day of the week
        const daysOfWeek = [
            'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
        ];
        const dayOfWeek = daysOfWeek[now.getDay()];

        res.status(200).send({dayOfWeek});

        // get the current time
        const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric' });
    }
    catch {
        res.status(500).send({ message: err.message });
    };
};
exports.getCurrentSupply = (req, res) => {
    try {
        let a=36157623
        res.status(200).json(a);
    }
    catch {
        res.status(500).send({ message: 'error' });
    };
};



