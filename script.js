const form = document.getElementById("downloadForm");
const input = document.getElementById("urlInput");
const result = document.getElementById("result");
const platforms = [
  {name:"Instagram",hosts:["instagram.com"]},
  {name:"TikTok",hosts:["tiktok.com"]},
  {name:"Facebook",hosts:["facebook.com","fb.watch"]},
  {name:"X / Twitter",hosts:["x.com","twitter.com"]},
  {name:"YouTube",hosts:["youtube.com","youtu.be"]}
];
const extensions = {
  video:["mp4","webm","mov","m4v","ogv"],
  image:["jpg","jpeg","png","gif","webp","avif","bmp","svg"],
  audio:["mp3","m4a","wav","ogg","oga","aac","flac","opus","aiff","wma"]
};
function classifyDirectMedia(url) {
  const path = url.pathname.toLowerCase();
  const ext = path.includes(".") ? path.split(".").pop() : "";
  for (const [type, list] of Object.entries(extensions)) if (list.includes(ext)) return type;
  return null;
}
function getPlatform(url) {
  const host = url.hostname.toLowerCase();
  return platforms.find(p => p.hosts.some(h => host === h || host.endsWith("." + h)))?.name || null;
}
function safeUrl(raw) {
  const url = new URL(raw);
  if (!["http:", "https:"].includes(url.protocol)) throw new Error("Gunakan tautan yang dimulai dengan https:// atau http://.");
  if (!url.hostname.includes(".")) throw new Error("Tautan tidak terlihat valid. Periksa kembali alamatnya.");
  return url;
}
function showMessage(title, message, actions = []) {
  result.replaceChildren();
  const heading = document.createElement("h2"); heading.textContent = title;
  const paragraph = document.createElement("p"); paragraph.textContent = message;
  result.append(heading, paragraph);
  if (actions.length) {
    const row = document.createElement("div"); row.className = "result-actions";
    for (const action of actions) {
      const a = document.createElement("a");
      a.className = "action-link" + (action.secondary ? " secondary" : "");
      a.textContent = action.label; a.href = action.href; a.target = "_blank"; a.rel = "noopener noreferrer";
      if (action.download) { a.download = ""; a.target = "_self"; }
      row.append(a);
    }
    result.append(row);
  }
  result.hidden = false;
}
form.addEventListener("submit", event => {
  event.preventDefault();
  let url;
  try { url = safeUrl(input.value.trim()); }
  catch (error) { showMessage("Tautan belum valid", error.message); return; }
  const type = classifyDirectMedia(url);
  const platform = getPlatform(url);
  if (type) {
    const labels = {video:"Video", image:"Gambar", audio:"Audio / suara"};
    showMessage(`${labels[type]} langsung terdeteksi`, "Browser akan mencoba membuka atau mengunduh file dari sumber. Keberhasilan bergantung pada izin server, nama file, dan dukungan browser.", [
      {label:"Buka file",href:url.href},
      {label:"Coba unduh",href:url.href,download:true,secondary:true}
    ]);
  } else if (platform) {
    const message = platform === "YouTube"
      ? "YouTube terdeteksi. Gunakan fitur unduhan resmi yang tersedia atau cara yang secara eksplisit diizinkan pemilik hak. Website statis ini tidak mengekstrak audio/video dari postingan."
      : `${platform} terdeteksi. Buka postingan asli. Website statis ini tidak mengambil file privat, melewati login, atau mengikis konten platform.`;
    showMessage(`${platform} terdeteksi`, message, [{label:"Buka sumber asli",href:url.href}]);
  } else {
    showMessage("Tautan siap diperiksa", "Tautan ini tidak tampak seperti URL file media langsung. Buka sumbernya untuk memeriksa apakah file bisa diunduh.", [{label:"Buka tautan",href:url.href}]);
  }
});
