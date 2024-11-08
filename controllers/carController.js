const express = require('express');
const fs = require('fs');
const { request } = require('http');
const path = require('path');
const multer = require('multer');
const xml2js = require('xml2js');

const title = "NieKupZłoma"

express.urlencoded({ extended: true })

exports.GetAllCar = async (req, res) => {
    const allCars = await asyncLoadCars()
    const brands = [...new Set(allCars.map(car => car.brand))]
    const models = [...new Set(allCars.map(car => car.model))]
    res.render('cars/cars', {
        title,
        cars: allCars,
        brands,
        models,
        selectedBrand: 'Marka',
        selectedModel: 'Model',
        selectedValueMin: '',
        selectedValueMax: ''
    })
};

exports.GetSelectedCar = async (req, res) => {
    const formData = req.query
    const { brand, model, valueMin, valueMax } = formData
    const min = parseFloat(valueMin)
    const max = parseFloat(valueMax)

    const allCars = await asyncLoadCars();

    const brands = [...new Set(allCars.map(car => car.brand))]
    const models = [...new Set(allCars.map(car => car.model))]

    const filteredCars = searchCar(allCars, model, brand, min, max)

    res.render('cars/cars', {
        title: 'Lista samochodów',
        cars: filteredCars,
        brands,
        models,
        selectedBrand: brand || 'Marka',
        selectedModel: model || 'Model',
        selectedValueMin: valueMin || '',
        selectedValueMax: valueMax || ''
    })
};

exports.AddCarForm = (req, res) => {
    res.render('cars/add', { title })
};

exports.AddCar = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.redirect('/cars', { error: "Błąd podczas przesyłania zdjęcia na serwer!" })
        }
        const { brand, model, year, color, price } = req.body
        const carImage = req.file ? req.file.filename : null
        const carData = {
            brand: brand ?? "Brak",
            model: model ?? "Brak",
            year: parseInt(year) || 0,
            color: color ?? "Brak",
            price: parseInt(price) || 0,
            image: carImage ?? ""
        };
        let cars = await asyncLoadCars();
        const id = cars.length > 0 ? cars[cars.length - 1].id + 1 : 1;
        cars.push({ id, ...carData });
        await asyncSaveCars(cars);
        res.redirect('/cars');
    });
};

exports.ShowCar = async (req, res) => {
    const id = parseInt(req.params.id) ?? 0
    const cars = await asyncLoadCars()
    const car = cars.find(item => item.id === id)
    if (car) {
        res.render('cars/show', { title, car });
    } else {
        res.render('404')
    }
};

exports.EditCarImageForm = async (req, res) => {
    const id = parseInt(req.params.id) ?? 0
    const cars = await asyncLoadCars()
    const car = cars.find(item => item.id === id)
    if (car) {
        res.render('cars/editImage', { title, car });
    } else {
        res.render('404')
    }
};

exports.EditCarImage = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).send('Błąd podczas przesyłania pliku');
        }

        const { id } = req.params;
        const newFile = req.file;

        if (!newFile) {
            return res.status(400).send('Brak przesyłanego pliku.');
        }

        let cars = await asyncLoadCars();

        const carIndex = cars.findIndex(car => car.id == id);

        if (carIndex === -1) {
            return res.status(404).send('Samochód nie znaleziony.');
        }

        if (cars[carIndex].image) {
            const oldFilePath = path.join(__dirname, '..', 'public/images', 'cars', cars[carIndex].image);
            try {
                if (fs.existsSync(oldFilePath)) {
                    await fs.unlinkSync(oldFilePath);
                }
            } catch (err) {
                console.error("Błąd podczas usuwania starego zdjęcia:", err);
            }
        }

        cars[carIndex].image = newFile.filename;

        await asyncSaveCars(cars);

        res.redirect('/cars/' + id);
    });
};

exports.EditCarForm = async (req, res) => {
    const id = parseInt(req.params.id) ?? 0
    const cars = await asyncLoadCars()
    const car = cars.find(item => item.id === id)
    if (car) {
        res.render('cars/edit', { title, car });
    } else {
        res.render('404')
    }
};

exports.EditCar = async (req, res) => {
    const { brand, model, year, color, price } = req.body;
    let cars = await asyncLoadCars();

    const carId = parseInt(req.params.id);
    const carIndex = cars.findIndex(car => car.id === carId);

    const carData = {
        brand: brand ?? "Brak",
        model: model ?? "Brak",
        year: parseInt(year) || 0,
        color: color ?? "Brak",
        price: parseInt(price) || 0,
        image: cars[carIndex].image ?? ""
    };

    if (carIndex === -1) {
        return res.status(404).send('Samochód nie został znaleziony');
    }

    cars[carIndex] = { ...cars[carIndex], ...carData };

    await asyncSaveCars(cars);

    res.redirect('/cars');
}

exports.ShowJSON = async (req, res) => {
    const allCars = await asyncLoadCars()
    res.json(allCars);
};

exports.ShowXML = async (req, res) => {
    const allCars = await asyncLoadCars()
    const builder = new xml2js.Builder();
    const xml = builder.buildObject({ cars: allCars });
    
    res.header("Content-Type", "application/xml");
    res.send(xml);
};


exports.SaveTXT = async (req, res) => {
    const filePath = path.join(__dirname, '..', 'data', 'cars.json');
    const fileName = 'cars.json';

    res.download(filePath, fileName, (err) => {
        console.log(filePath)
        if (err) {
            res.status(500).send('Wystąpił błąd podczas pobierania pliku.');
        }
    });
};

asyncSaveCars = async (data) => {
    const filePath = path.join('data', 'cars.json');
    fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
        if (err) {
            console.error('Błąd podczas zapisywania danych:', err);
        } else {
            console.log('Dane zapisane pomyślnie do data.json');
        }
    });
}

asyncLoadCars = async () => {
    const filePath = path.join('data', 'cars.json');
    const rawData = fs.readFileSync(filePath);
    const cars = JSON.parse(rawData);
    return cars;
}

const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, 'public/images/cars/');
        },
        filename: (req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, uniqueSuffix + '-' + file.originalname);
        }
    }),
    limits: { fileSize: 1024 * 1024 * 5 }, // Maksymalny rozmiar pliku 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp/; // Dozwolone typy plików
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(file.originalname.split('.').pop().toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Tylko pliki JPG, JPEG, PNG, GIF i WEBP są dozwolone.'));
        }
    }
}).single('file');

const searchCar = (allCarsList, modelSelected, brandSelected, valueMin, valueMax) => {
    return allCarsList.filter(car => {
        const matchesModel = !modelSelected || modelSelected === "Model" || car.model === modelSelected
        const matchesBrand = !brandSelected || brandSelected === "Marka" || car.brand === brandSelected
        const matchesMin = isNaN(valueMin) || car.price >= valueMin
        const matchesMax = isNaN(valueMax) || car.price <= valueMax
        return matchesModel && matchesBrand && matchesMin && matchesMax
    });
};