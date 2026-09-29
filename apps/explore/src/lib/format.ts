/**
 * Image and price helpers from the blueprint. Images are served by the shell
 * from /cdn, on the same origin, so no image server prefix is needed.
 */
export function src(image: string, size: number): string {
  return image.replace("[size]", `${size}`);
}

export function srcset(image: string, sizes: number[]): string {
  return sizes.map((size) => `${src(image, size)} ${size}w`).join(", ");
}

export function fmtprice(price: number): string {
  return `${price},00 Ø`;
}
