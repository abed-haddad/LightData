const bucketName = "your-bucket-name"; // 🔹 Replace with your actual bucket name

const seasonalFiles = {
    Spring: "Spring/5.4_G500_Southwest_Wall_2024-03-12_to_2024-03-26.xlsx",
    Summer: "Summer/5.4_G500_Southwest_Wall_2024-06-11_to_2024-06-25.xlsx",
    Fall: "Fall/5.4_G500_Southwest_Wall_2024-09-10_to_2024-09-24.xlsx",
    Winter: "Winter/5.4_G500_Southwest_Wall_2024-12-10_to_2024-12-24.xlsx"
};

function getGoogleStorageUrl(season) {
    return `https://storage.googleapis.com/${bucketName}/${seasonalFiles[season]}`;
}

async function fetchFromGoogleStorage(season) {
    const fileUrl = getGoogleStorageUrl(season);

    try {
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("File not found");

        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const x = [], y = [];
        jsonData.slice(1).forEach(row => {
            const [date, time, temp, rh, illuminance, uv] = row;
            if (date && time && illuminance) {
                x.push(`${date} ${time}`);
                y.push(parseFloat(illuminance));
            }
        });

        plotData(x, y, fileUrl);
    } catch (error) {
        console.error("Error fetching file:", error);
        document.getElementById('error-message').style.display = 'block';
    }
}

function showSeason(season) {
    document.querySelectorAll('.season-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector(`.season-tab[onclick="showSeason('${season}')"]`).classList.add('active');
    fetchFromGoogleStorage(season);
}

function plotData(x, y, filename) {
    Plotly.newPlot("chart-container", [{
        x: x,
        y: y,
        mode: 'lines',
        type: 'scatter',
        name: filename
    }], {
        title: `Illuminance Data (${filename})`,
        xaxis: { title: 'Timestamp' },
        yaxis: { title: 'Illuminance (fc)' }
    });
}
