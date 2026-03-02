export const currentMonth = () => {
  const today = new Date();
  const localDateString = today.toLocaleString("default", { month: "long" });
  const split = localDateString.split(" ");
  console.log(localDateString);
  const month = split[0];

  return month + " " + today.getFullYear();
};
