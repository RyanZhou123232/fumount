export type DesignCollection = 'ritual' | 'treasury';
export type LocalizedName = {en: string; zh: string};
export type DesignProduct = {
  key: string;
  collection: DesignCollection;
  name: LocalizedName;
  aliases: readonly string[];
};

export const designCollections = {
  ritual: {en: 'Ritual Collection', zh: '素境系列'},
  treasury: {en: 'Treasury Collection', zh: '珍藏系列'},
} as const;

export const designProducts: readonly DesignProduct[] = [
  {
    key: 'ritual-ivory',
    collection: 'ritual',
    name: {en: 'Ivory', zh: '素白'},
    aliases: ['ivory', 'white', '素白', '白色'],
  },
  {
    key: 'ritual-ink',
    collection: 'ritual',
    name: {en: 'Ink', zh: '墨黑'},
    aliases: ['ink', 'black', '墨黑', '黑色'],
  },
  {
    key: 'treasury-vermilion',
    collection: 'treasury',
    name: {en: 'Vermilion', zh: '朱红'},
    aliases: ['vermilion', 'red', '朱红', '红色'],
  },
  {
    key: 'treasury-imperial-gold',
    collection: 'treasury',
    name: {en: 'Imperial Gold', zh: '帝王金'},
    aliases: ['imperial gold', 'gold', '帝王金', '金色'],
  },
  {
    key: 'treasury-walnut',
    collection: 'treasury',
    name: {en: 'Walnut', zh: '木色'},
    aliases: ['walnut', 'wood', '木色', '胡桃木'],
  },
  {
    key: 'treasury-marble',
    collection: 'treasury',
    name: {en: 'Marble Grey', zh: '大理石灰'},
    aliases: ['marble grey', 'marble gray', '大理石灰'],
  },
];

export const bestSellerKeys = [
  'ritual-ivory',
  'ritual-ink',
  'treasury-vermilion',
  'treasury-walnut',
];

export function designImage(key: string) {
  return `/fumount-design/images/product-${key}.png`;
}
