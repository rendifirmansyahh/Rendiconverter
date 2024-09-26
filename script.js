// Fitur untuk memeriksa kata kunci saat login
document.getElementById('passwordForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const validKeywords = ['1111']; // Kata kunci yang valid
  const passwordInput = document.getElementById('passwordInput').value.trim().toLowerCase(); // Kata kunci yang dimasukkan
  const errorMessage = document.getElementById('errorMessage');

  if (validKeywords.includes(passwordInput)) {
      document.getElementById('loginContainer').style.display = 'none'; // Sembunyikan form login
      document.getElementById('content').classList.remove('hidden');    // Tampilkan konten
  } else {
      errorMessage.style.display = 'block';  // Tampilkan pesan kesalahan jika kata kunci salah
  }
});

// Fitur untuk memproses file setelah login berhasil
document.getElementById('processFilesBtn').addEventListener('click', function() {
  const files = document.getElementById('file-input').files;
  const fileAreas = document.getElementById('file-areas');
  const startCategory = document.getElementById('startCategoryInput').value.trim().toLowerCase(); // Ambil kategori awal
  const globalContactName = document.getElementById('globalContactNameInput').value.trim(); // Ambil nama kontak global

  fileAreas.innerHTML = ''; // Kosongkan div sebelum menambahkan textarea baru

  Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = function(e) {
          const textArea = document.createElement('textarea');
          textArea.classList.add('small-textarea');
          textArea.value = e.target.result;

          // Input untuk memasukkan nama file VCF
          const fileNameInput = document.createElement('input');
          fileNameInput.type = 'text';
          fileNameInput.placeholder = `Masukkan nama file VCF (Default: ${file.name.replace('.txt', '')})`;
          fileNameInput.classList.add('file-name-input');

          const fileNameLabel = document.createElement('label');
          fileNameLabel.textContent = `Nama File Asal: ${file.name}`;
          fileNameLabel.classList.add('file-name-label');

          const contactsCountLabel = document.createElement('p');
          const lines = e.target.result.split('\n').map(line => line.trim());
          const contactsCount = lines.filter(line => !isNaN(line) && line !== '').length;
          contactsCountLabel.textContent = `Jumlah Kontak: ${contactsCount}`;

          const generateButton = document.createElement('button');
          generateButton.textContent = 'Generate VCF';
          generateButton.classList.add('generate-vcf-btn');
          generateButton.addEventListener('click', () => {
              const fileContactName = globalContactName || file.name.replace('.txt', ''); // Gunakan nama file jika nama kontak kosong
              const filename = fileNameInput.value.trim() || file.name.replace('.txt', ''); // Gunakan nama file asli jika nama file kosong
              let vcfContent = '';
              let contactIndex = 1;
              let foundStartCategory = startCategory === ''; // Jika kategori kosong, mulai konversi langsung
              let validCategories = ['admin', 'navy', 'anggota']; // Kategori yang valid
              let startConverting = false; // Flag untuk memulai konversi setelah kategori ditemukan

              lines.forEach(line => {
                  const lowerLine = line.toLowerCase();

                  // Jika kategori diisi, mulai dari kategori yang dipilih
                  if (startCategory && lowerLine === startCategory) {
                      foundStartCategory = true; // Mulai konversi dari kategori yang dipilih
                      startConverting = true; // Mulai konversi setelah kategori ditemukan
                      return; // Jangan konversi baris kategori itu sendiri
                  } else if (startCategory && validCategories.includes(lowerLine)) {
                      startConverting = false; // Berhenti jika menemukan kategori lain saat startCategory dipilih
                  }

                  // Mulai konversi hanya jika startConverting true
                  if ((foundStartCategory || !startCategory) && startConverting && line && !validCategories.includes(lowerLine)) {
                      let phoneNumber = line;
                      if (!phoneNumber.startsWith('+')) {
                          phoneNumber = '+' + phoneNumber;
                      }
                      vcfContent += `BEGIN:VCARD\nVERSION:3.0\nFN:${fileContactName} ${contactIndex}\nTEL:${phoneNumber}\nEND:VCARD\n\n`;
                      contactIndex++;
                  }
              });

              if (vcfContent) {
                  const blob = new Blob([vcfContent], { type: 'text/vcard' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${filename}_${startCategory || 'semua_kontak'}.vcf`;
                  a.textContent = `Download ${filename}_${startCategory || 'semua_kontak'}.vcf`;
                  a.style.display = 'block';
                  a.click();
                  URL.revokeObjectURL(url);
              } else {
                  console.error('Tidak ada konten VCF yang digenerate.');
                  alert('Tidak ada kontak yang berhasil di-convert.');
              }
          });

          fileAreas.appendChild(fileNameLabel);
          fileAreas.appendChild(fileNameInput);
          fileAreas.appendChild(textArea);
          fileAreas.appendChild(contactsCountLabel);
          fileAreas.appendChild(generateButton);
      };
      reader.readAsText(file);
  });
});
