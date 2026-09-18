import { createContext, PropsWithChildren, use, useEffect, useState } from "react";
import { Item } from "../types/cards";
import React from "react";
import { useSession } from "./ctx";
import { fetchItems } from "../apis/load";

export type WardrobeContext = {
    refreshItems : () => void;
    noItems : boolean;
    items : Item[];
    colors : string[];
    shops : string[];
    sizes : string[];  
    loading : boolean; 
} | null;

const ItemContext = createContext<WardrobeContext>(null);

// Use this to access item information
export function useItems(){
    const value = use(ItemContext);
    if(!value){
        new Error('use items must be wrapped in a provider');
    }
    return value;
}

// Wrapper around react components
export function ItemProvider({children} : PropsWithChildren){
    const [items, setItems] = useState<Item[]>([])
    const [noItems, setNoItems] = useState<boolean>(true);
    const [colors, setColors] = useState<string[]>([]);
    const [shops, setShops] = useState<string[]>([]);
    const [sizes, setSizes] = useState<string[]>([]);
    const session = useSession();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const loadItems = async () => {
        setNoItems(false);
        setIsLoading(true);
        await fetchItems({
            session : session,
            onEmpty : () => setNoItems(true),
            cleanup : () => {
                setItems([]);
                setNoItems(false);
            },
            onItemChunk : (chunk : string) => {
                const dict = JSON.parse(chunk);
                const item : Item = {
                    _id : dict['_id'],
                    shop : dict['shop'],
                    favorite : dict['favorite'] == "yes" ? true : false,
                    size : dict['size'],
                    price : dict['price'],
                    category : dict['category'],
                    name : dict['name'],
                    color : dict['color'],
                    image : dict['image'].trim()
                };
                if(!(colors.includes(dict['color']))){
                    setColors(colors.concat(dict['color']));
                }
                if(!(shops.includes(dict['shop']))){
                    setShops(shops.concat(dict['shop']));
                }
                if(!(sizes.includes(dict['size']))){   
                    setSizes(sizes.concat(dict['size']));
                }
                if(!(dict['_id'] in items.map((v) => v._id))){
                    setItems(prev => [...prev, item]);
                } else {
                    console.log('Duplicate item key: ', dict['_id'])
                }
            }
        })
        setIsLoading(false);
    }

    return(
        <ItemContext.Provider value = {{
            items : items,
            refreshItems : async () => await loadItems(),
            noItems : noItems,
            shops : shops,
            colors : colors,
            sizes : sizes,
            loading : isLoading
        }}>
            {children}
        </ItemContext.Provider>
    )
}
