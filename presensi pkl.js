<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Presensi PKL Siswa SMK KP Baleendah</title>
    <!-- Memuat Tailwind CSS dari CDN untuk styling yang cepat dan responsif -->
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Mengatur font dasar untuk seluruh halaman */
        body {
            font-family: 'Inter', sans-serif;
        }
        /* Styling tambahan untuk responsivitas dan estetika */
        .container {
            max-width: 600px;
        }
        .message-box {
            transition: all 0.3s ease-in-out;
        }
        /* Video dan Canvas styling dihapus karena fitur kamera dihilangkan */
    </style>
</head>
<body class="bg-gray-100 flex flex-col items-center justify-center min-h-screen p-4">
    <div class="container bg-white p-6 md:p-8 rounded-xl shadow-lg w-full">
        <h1 class="text-2xl md:text-3xl font-bold text-center text-blue-800 mb-2">
            Presensi PKL Siswa
        </h1>
        <h2 class="text-lg md:text-xl font-semibold text-center text-blue-600 mb-6">
            SMK KP Baleendah
        </h2>

        <div class="mb-4">
            <label for="studentNameSelect" class="block text-gray-700 text-sm font-bold mb-2">Pilih Nama Siswa:</label>
            <select
                id="studentNameSelect"
                onchange="updateStudentId()"
                class="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">-- Memuat daftar siswa --</option>
                <!-- Opsi nama siswa akan dimuat di sini oleh JavaScript -->
            </select>
        </div>

        <div class="mb-6">
            <label for="studentId" class="block text-gray-700 text-sm font-bold mb-2">Nomor Induk Siswa (NIS):</label>
            <input
                type="text"
                id="studentId"
                placeholder="NIS akan terisi otomatis"
                readonly
                class="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight bg-gray-100 cursor-not-allowed"
            />
        </div>

        <div class="mb-6">
            <label for="pklLocation" class="block text-gray-700 text-sm font-bold mb-2">Tempat PKL:</label>
            <input
                type="text"
                id="pklLocation"
                placeholder="Tempat PKL akan terisi otomatis"
                readonly
                class="shadow appearance-none border rounded-lg w-full py-3 px-4 text-gray-700 leading-tight bg-gray-100 cursor-not-allowed"
            />
        </div>

        <div class="flex flex-col md:flex-row gap-4 mb-6">
            <button
                onclick="submitAttendance('check-in')"
                class="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150 transform hover:scale-105"
            >
                Check-in
            </button>
            <button
                onclick="submitAttendance('check-out')"
                class="flex-1 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150 transform hover:scale-105"
            >
                Check-out
            </button>
        </div>

        <div
            id="messageBox"
            class="message-box hidden p-4 rounded-lg text-center font-medium mt-6"
        >
            <!-- Pesan status akan ditampilkan di sini -->
        </div>

        <div id="loadingIndicator" class="hidden text-center text-blue-500 mt-4">
            Mengirim data kehadiran...
        </div>
    </div>

    <!-- Footer diubah agar tidak menggunakan absolute positioning -->
    <div class="mt-12 text-gray-500 text-xs text-center w-full">
        <p>&copy; 2025 SMK KP Baleendah. Semua Hak Dilindungi.</p>
    </div>

    <script>
        // URL Web App Google Apps Script Anda (AKAN DIISI SETELAH DEPLOY APPS SCRIPT)
        const GOOGLE_APPS_SCRIPT_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbybuQSSbriYdtieuYdCPcCTnlLeUqp1ojMlpGTt_u3GL2MzGcCzzHN3JjgOQyf4w-uh/exec'; 
        // URL data CSV dari Google Sheets yang telah dipublikasikan
        const CSV_STUDENT_DATA_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSNc6bWOFXqweNwN979P8YlO7aOF7ZoxMpTHvTTRvi7N24cfRcEJHrRA_O4cSO9PR2GFm3bImWoJM0u/pub?gid=0&single=true&output=csv';

        let studentsData = []; // Array untuk menyimpan data siswa dari CSV
        const studentNameSelect = document.getElementById('studentNameSelect');
        const studentIdInput = document.getElementById('studentId');
        const pklLocationInput = document.getElementById('pklLocation'); // New: Tempat PKL input
        const messageBox = document.getElementById('messageBox');
        const loadingIndicator = document.getElementById('loadingIndicator');
        // Elemen terkait kamera dihapus:
        // const videoElement = document.getElementById('videoElement');
        // const canvasElement = document.getElementById('canvasElement');
        // const snapButton = document.getElementById('snapButton');
        // const photoPreview = document.getElementById('photoPreview');
        // let stream; // Untuk menyimpan stream dari kamera
        // let photoDataUrl = ''; // Untuk menyimpan data URL foto

        // Fungsi untuk menampilkan pesan di messageBox
        function showMessage(message, type = 'info') {
            messageBox.classList.remove('hidden', 'bg-green-100', 'border-green-400', 'text-green-700', 'bg-red-100', 'border-red-400', 'text-red-700', 'bg-yellow-100', 'border-yellow-400', 'text-yellow-700');
            if (type === 'success') {
                messageBox.classList.add('bg-green-100', 'border', 'border-green-400', 'text-green-700');
            } else if (type === 'error') {
                messageBox.classList.add('bg-red-100', 'border', 'border-red-400', 'text-red-700');
            } else { // info or warning
                messageBox.classList.add('bg-yellow-100', 'border', 'border-yellow-400', 'text-yellow-700');
            }
            messageBox.innerHTML = message;
        }

        // Fungsi untuk mengambil lokasi GPS
        function getLocation() {
            return new Promise((resolve, reject) => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            console.log("Lokasi berhasil didapatkan:", position.coords.latitude, position.coords.longitude);
                            resolve({
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude,
                            });
                        },
                        (error) => {
                            console.error("Error mendapatkan lokasi GPS:", error.code, error.message);
                            let errorMessage = "Gagal mendapatkan lokasi GPS. ";
                            switch(error.code) {
                                case error.PERMISSION_DENIED:
                                    errorMessage += "Izin lokasi ditolak oleh pengguna.";
                                    break;
                                case error.POSITION_UNAVAILABLE:
                                    errorMessage += "Informasi lokasi tidak tersedia.";
                                    break;
                                case error.TIMEOUT:
                                    errorMessage += "Permintaan waktu habis untuk mendapatkan lokasi.";
                                    break;
                                case error.UNKNOWN_ERROR:
                                    errorMessage += "Terjadi kesalahan yang tidak diketahui.";
                                    break;
                            }
                            errorMessage += " Pastikan GPS aktif dan diizinkan untuk browser ini.";
                            reject(errorMessage);
                        },
                        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                    );
                } else {
                    reject("Geolocation tidak didukung oleh browser ini.");
                }
            });
        }

        // Fungsi terkait kamera dihapus:
        // async function startCamera() { ... }
        // snapButton.addEventListener('click', () => { ... });

        // Fungsi untuk parsing CSV sederhana
        function parseCSV(csvString) {
            console.log("Mulai parsing CSV. Ukuran teks:", csvString.length); // Log ukuran teks CSV
            const lines = csvString.trim().split('\n');
            console.log("Jumlah baris terdeteksi:", lines.length); // Log jumlah baris
            if (lines.length === 0) return []; // Handle kasus CSV kosong

            const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
            console.log("Header CSV yang terdeteksi:", headers); // Log header
            const data = [];

            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(value => value.trim().replace(/"/g, ''));
                if (values.length === headers.length) {
                    let row = {};
                    for (let j = 0; j < headers.length; j++) {
                        row[headers[j]] = values[j];
                    }
                    data.push(row);
                } else {
                    console.warn(`Baris ${i + 1} dilewati karena jumlah kolom tidak cocok (${values.length} vs ${headers.length}): ${lines[i]}`); // Peringatan jika baris tidak valid
                }
            }
            console.log("Data setelah parsing:", data); // Log data yang berhasil diurai
            return data;
        }

        // Fungsi untuk memuat data siswa dari CSV dan mengisi dropdown
        async function loadStudentDataAndPopulateDropdown() {
            loadingIndicator.classList.remove('hidden');
            studentNameSelect.innerHTML = '<option value="">-- Memuat daftar siswa --</option>'; // Pesan loading di dropdown
            try {
                console.log("Mengambil data siswa dari URL:", CSV_STUDENT_DATA_URL);
                const response = await fetch(CSV_STUDENT_DATA_URL);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const csvText = await response.text();
                studentsData = parseCSV(csvText);

                // Mengisi dropdown dengan nama siswa
                studentNameSelect.innerHTML = '<option value="">-- Pilih Nama Anda --</option>'; // Reset options setelah data dimuat
                if (studentsData.length === 0) {
                    showMessage("Daftar siswa kosong atau tidak dapat dimuat.", 'warning');
                    studentNameSelect.innerHTML = '<option value="">-- Daftar siswa kosong --</option>';
                    return;
                }

                studentsData.forEach(student => {
                    // Pastikan kolom 'Nama Lengkap' dan 'No. Pendaftaran' ada di data CSV
                    if (student['Nama Lengkap'] && student['No. Pendaftaran']) { 
                        const option = document.createElement('option');
                        option.value = student['No. Pendaftaran']; // Value adalah NIS
                        option.textContent = student['Nama Lengkap'];
                        studentNameSelect.appendChild(option);
                    } else {
                        console.warn("Baris siswa dilewati karena data Nama Lengkap atau No. Pendaftaran tidak lengkap:", student);
                    }
                });
                console.log("Dropdown siswa berhasil diisi dengan", studentsData.length, "data.");

            } catch (error) {
                console.error("Kesalahan saat memuat data siswa untuk dropdown:", error);
                showMessage("Gagal memuat daftar siswa. Mohon coba lagi nanti. Periksa konsol untuk detail.", 'error');
                studentNameSelect.innerHTML = '<option value="">-- Gagal memuat siswa --</option>';
            } finally {
                loadingIndicator.classList.add('hidden');
            }
        }

        // Fungsi untuk memperbarui NIS dan Tempat PKL berdasarkan pilihan nama siswa
        function updateStudentId() {
            const selectedNis = studentNameSelect.value;
            if (selectedNis) {
                const selectedStudent = studentsData.find(student => student['No. Pendaftaran'] === selectedNis);
                if (selectedStudent) {
                    studentIdInput.value = selectedStudent['No. Pendaftaran'];
                    // New: Isi Tempat PKL otomatis
                    pklLocationInput.value = selectedStudent['Tempat PKL'] || ''; // Pastikan nama kolom di CSV adalah "Tempat PKL"
                } else {
                    studentIdInput.value = ''; 
                    pklLocationInput.value = ''; // Kosongkan jika tidak ditemukan
                }
            } else {
                studentIdInput.value = ''; 
                pklLocationInput.value = ''; // Kosongkan jika tidak ada yang dipilih
            }
        }

        // Fungsi utama untuk mengirim data kehadiran
        async function submitAttendance(type) {
            const studentName = studentNameSelect.options[studentNameSelect.selectedIndex].text; // Ambil nama dari teks option
            const studentId = studentIdInput.value.trim();
            const pklLocation = pklLocationInput.value.trim(); // Ambil nilai Tempat PKL

            if (!studentName || studentName === '-- Pilih Nama Anda --' || studentName === '-- Memuat daftar siswa --' || studentName === '-- Daftar siswa kosong --' || studentName === '-- Gagal memuat siswa --' || !studentId) {
                showMessage("Mohon pilih Nama Siswa dari daftar dan pastikan NIS terisi.", 'warning');
                return;
            }
            if (!pklLocation) { // Validasi Tempat PKL
                showMessage("Mohon masukkan Tempat PKL.", 'warning');
                return;
            }
            if (GOOGLE_APPS_SCRIPT_WEB_APP_URL === 'PASTE_URL_WEB_APP_ANDA_DI_SINI') {
                showMessage("URL Google Apps Script belum diatur. Mohon atur URL di kode.", 'error');
                return;
            }


            loadingIndicator.classList.remove('hidden');
            messageBox.classList.add('hidden');

            try {
                const location = await getLocation(); // Memanggil fungsi getLocation
                const timestamp = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' }); // Waktu Indonesia Barat

                const data = {
                    type: type,
                    timestamp: timestamp,
                    name: studentName,
                    id: studentId,
                    pklLocation: pklLocation, // Tambahkan Tempat PKL ke data
                    latitude: location.latitude,
                    longitude: location.longitude,
                };

                const response = await fetch(GOOGLE_APPS_SCRIPT_WEB_APP_URL, {
                    method: 'POST',
                    mode: 'no-cors', // Penting untuk menghindari masalah CORS dengan Google Apps Script
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });

                // Karena mode 'no-cors', response.ok akan selalu true.
                // Kita harus mengandalkan skenario bahwa Apps Script akan memprosesnya.
                // Untuk konfirmasi, Apps Script bisa mengirim email atau notifikasi lain.
                // Di sini kita asumsikan berhasil jika tidak ada error fetch.
                showMessage(`Presensi ${type} berhasil dicatat! Terima kasih.`, 'success');
                // Reset form setelah berhasil
                studentNameSelect.value = ''; // Reset dropdown
                studentIdInput.value = '';
                pklLocationInput.value = ''; // Reset Tempat PKL
                
            } catch (error) {
                console.error("Error saat mengirim data:", error);
                showMessage(`Gagal mencatat presensi ${type}: ${error}.`, 'error');
            } finally {
                loadingIndicator.classList.add('hidden');
            }
        }

        // Muat data siswa dan mulai kamera saat halaman dimuat
        document.addEventListener('DOMContentLoaded', () => {
            loadStudentDataAndPopulateDropdown();
        });
    </script>
</body>
</html>
