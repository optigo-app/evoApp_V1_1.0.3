import { atom } from "recoil";


export const cartItemLength = atom({
  key: 'cartItemLength',
  default: 0
})

export const wishlistItemLength = atom({
  key: 'wishlistItemLength',
  default: 0
})
