# Garage Sale

A standalone static garage-sale page. Open `index.html` in a browser.

## Open or close the entire sale

At the very top of `script.js`, set:

```js
const SALE_OPEN = true;  // open; customers can reserve available items
```

Change it to `false` to show **Garage sale closed**, keep the inventory visible, and hide/disable all reservation controls. Commit the change to GitHub to publish it. Set back to `true` to reopen. This is a site-wide switch, separate from each item's `sold` setting.

## Mark an item sold

Open `script.js`, find the item in the `products` array, and add or change:

```js
sold: true,
```

Set it back to `false` (or remove the line) to make the item available again. Sold items remain visible, are marked **SOLD**, and cannot be reserved.

## Add multiple photos to an item

Each product has an `images` array. Put every photo for that item in the array:

```js
images: [
  "photos/chair-front.jpg",
  "photos/chair-side.jpg",
  "photos/chair-detail.jpg",
],
```

Clicking the card photo opens that item's gallery. Multiple-photo items get previous/next controls and support the left/right arrow keys. Escape closes the lightbox.