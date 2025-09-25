export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);

  const day = String(date.getDate()).padStart(2, '0');
  const month = formatMonth(date.getMonth());
  const year = date.getFullYear();

  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');

  return `${day} ${month} ${year}, ${hour}:${minute}`;
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);

  const day = String(date.getDate()).padStart(2, '0');
  const month = formatMonth(date.getMonth());
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

function formatMonth(monthIndex: number): string {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  return months[monthIndex] || '';
}
