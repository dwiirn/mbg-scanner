export interface HistoryItem {
  id: string;
  title: string;
  time: string;
  date: string;
  status: 'Segar' | 'Tidak Segar';
  rgb: string;
  staff: string;
  image?: string; // URI lokal atau nama file di uploads backend
}

// In-memory global store initialized with 10 mock items
export const historyData: HistoryItem[] = [
  {
    id: '1',
    title: 'Daging Ayam',
    time: '08:42',
    date: '23 Jun 2026',
    status: 'Segar',
    rgb: 'R: 214, G: 160, B: 142',
    staff: 'Dwi Prasetyo',
  },
  {
    id: '2',
    title: 'Daging Ayam',
    time: '08:31',
    date: '23 Jun 2026',
    status: 'Tidak Segar',
    rgb: 'R: 180, G: 130, B: 120',
    staff: 'Dwi Prasetyo',
  },
  {
    id: '3',
    title: 'Daging Ayam',
    time: '15:10',
    date: '22 Jun 2026',
    status: 'Segar',
    rgb: 'R: 214, G: 160, B: 142',
    staff: 'Dwi Prasetyo',
  },
  {
    id: '4',
    title: 'Daging Ayam',
    time: '11:20',
    date: '22 Jun 2026',
    status: 'Segar',
    rgb: 'R: 214, G: 160, B: 142',
    staff: 'Dwi Prasetyo',
  },
  {
    id: '5',
    title: 'Daging Ayam',
    time: '09:05',
    date: '21 Jun 2026',
    status: 'Tidak Segar',
    rgb: 'R: 180, G: 130, B: 120',
    staff: 'Dwi Prasetyo',
  },
  {
    id: '6',
    title: 'Daging Ayam',
    time: '17:45',
    date: '21 Jun 2026',
    status: 'Segar',
    rgb: 'R: 214, G: 160, B: 142',
    staff: 'Dwi Prasetyo',
  },
  {
    id: '7',
    title: 'Daging Ayam',
    time: '14:30',
    date: '20 Jun 2026',
    status: 'Segar',
    rgb: 'R: 214, G: 160, B: 142',
    staff: 'Dwi Prasetyo',
  },
  {
    id: '8',
    title: 'Daging Ayam',
    time: '10:15',
    date: '20 Jun 2026',
    status: 'Segar',
    rgb: 'R: 214, G: 160, B: 142',
    staff: 'Dwi Prasetyo',
  },
  {
    id: '9',
    title: 'Daging Ayam',
    time: '08:00',
    date: '19 Jun 2026',
    status: 'Tidak Segar',
    rgb: 'R: 180, G: 130, B: 120',
    staff: 'Dwi Prasetyo',
  },
  {
    id: '10',
    title: 'Daging Ayam',
    time: '16:20',
    date: '19 Jun 2026',
    status: 'Segar',
    rgb: 'R: 214, G: 160, B: 142',
    staff: 'Dwi Prasetyo',
  },
];

// Helper to push a new scan item to the beginning of the list
export const addHistoryItem = (status: 'Segar' | 'Tidak Segar', rgb: string, staff: string, image?: string) => {
  const now = new Date();

  const pad = (n: number) => n.toString().padStart(2, '0');
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const date = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

  const newItem: HistoryItem = {
    id: Date.now().toString(),
    title: 'Daging Ayam',
    time,
    date,
    status,
    rgb,
    staff,
    image,
  };

  historyData.unshift(newItem); // Newest first
};
