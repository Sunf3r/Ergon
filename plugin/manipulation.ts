import { Image } from 'imageScript'

export { crop }
async function crop(input: Buf) {
	const image = await Image.decode(input)

	const size = Math.min(image.width, image.height)
	// calc square size

	// calc the start point
	const x = Math.floor((image.width - size) / 2)
	const y = Math.floor((image.height - size) / 2)

	// crop the image
	const cropped = image.crop(x, y, size, size)

	return await cropped.encode(3)
}
