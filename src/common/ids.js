const MAX_IDS = 100000;
let id = 1;

export default function() {
  if (id > MAX_IDS) {
    id = 1;
  }
  return id++;
}