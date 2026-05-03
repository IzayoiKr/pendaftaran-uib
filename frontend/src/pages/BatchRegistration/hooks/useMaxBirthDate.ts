export function useMaxBirthDate(minAge: number = 15) {
  const today = new Date();

  const maxDate = new Date(
    today.getFullYear() - minAge,
    today.getMonth(),
    today.getDate()
  )
    .toISOString()
    .split("T")[0];

  return maxDate;
}