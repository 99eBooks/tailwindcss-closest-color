import tailwindColors from "./resources/tailwindColors";

type RGB = [number, number, number];
type Color = {
  name: string;
  hex: string;
  rgb: RGB;
  distance: number;
  percentage: number;
};

const colorInput: HTMLInputElement = document.querySelector(
  'input[type="color"]'
)!;
const hexInput: HTMLInputElement = document.querySelector('input[name="hex"]')!;
const colorList: HTMLUListElement = document.querySelector("#color-list")!;
const maxDistance: number = colorDistance([0, 0, 0], [255, 255, 255]);

function getColorsWithDistance(rgb: RGB) {
  return Object.entries(tailwindColors)
    .reduce((acc: Array<Color>, [name, value]) => {
      if (typeof value === "string") {
        const distance = hexToRGB(value)
          ? colorDistance(rgb, hexToRGB(value))
          : maxDistance;

        acc.push({
          name,
          hex: value,
          rgb: hexToRGB(value),
          distance,
          percentage: (1 - distance / maxDistance) * 100,
        });
      } else {
        Object.entries(value).forEach(([shade, color]) => {
          const distance = colorDistance(rgb, hexToRGB(color));
          acc.push({
            name: `${name}-${shade}`,
            hex: color,
            rgb: hexToRGB(color),
            distance,
            percentage: (1 - distance / maxDistance) * 100,
          });
        });
      }

      return acc;
    }, [])
    .sort((a, b) => a.distance - b.distance);
}

async function copyToClipboard(text: string) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.width = "1";
    textArea.style.height = "1";
    textArea.style.position = "fixed";

    document.body.append(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand("copy");

    document.body.removeChild(textArea);
  }
}

let toastTimeout: number;
function showToast(text: string) {
  if (toastTimeout) clearTimeout(toastTimeout);
  const toastEl = document.querySelector("#toast");
  toastEl!.innerHTML = text;
  toastEl!.classList.remove("hidden");
  toastEl!.classList.add("animate-bounce");

  toastTimeout = setTimeout(() => {
    toastEl!.classList.add("hidden");
    toastEl!.classList.remove("animate-bounce");
  }, 2000);
}

function handleUpdateColor() {
  const color = hexToRGB(colorInput.value);
  if (color) {
    const colors = getColorsWithDistance(color);
    colorList.innerHTML = "";
    colors.forEach((color) => {
      const li = document.createElement("li");
      li.style.width = "100%";
      li.style.backgroundColor = "#fff";
      li.style.padding = "1rem";
      li.style.display = "flex";
      li.style.justifyContent = "space-between";
      li.style.alignItems = "center";
      li.style.cursor = "copy";
      li.textContent = `${color.name} (${color.percentage.toFixed(2)}%)`;

      li.addEventListener("click", async () => {
        showToast(`Copied "${color.name}" to the clipboard`);
        copyToClipboard(color.name);
      });

      const block = document.createElement("div");
      block.style.width = "2rem";
      block.style.height = "2rem";
      block.style.backgroundColor = color.hex;
      block.style.border = "4px solid #333";
      li.appendChild(block);
      colorList.appendChild(li);
    });
  }
}
handleUpdateColor();

function colorDistance([r1, g1, b1]: RGB, [r2, g2, b2]: RGB) {
  return Math.sqrt(
    Math.pow(r2 - r1, 2) + Math.pow(g2 - g1, 2) + Math.pow(b2 - b1, 2)
  );
}

function hexToRGB(hex: string): RGB {
  if (hex.length === 4) {
    const r = parseInt(hex[1] + hex[1], 16);
    const g = parseInt(hex[2] + hex[2], 16);
    const b = parseInt(hex[3] + hex[3], 16);

    return [r, g, b];
  } else if (hex.length === 7) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return [r, g, b];
  } else {
    return [0, 0, 0];
  }
}

function handleColorChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const color = input.value;
  hexInput.value = color;
  handleUpdateColor();
}

function handleHexChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const hex = input.value;
  colorInput.value = hex;
  handleUpdateColor();
}

colorInput.addEventListener("input", handleColorChange);
hexInput.addEventListener("input", handleHexChange);
