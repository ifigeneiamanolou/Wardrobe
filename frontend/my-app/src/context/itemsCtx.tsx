import { createContext, PropsWithChildren, use, useEffect, useState } from "react";
import { Item } from "../types/cards";
import React from "react";
import { useSession } from "./ctx";
import { fetchItems } from "../apis/load";

export type WardrobeContext = {
    refreshItems : () => void;
    noItems : boolean;
    items : Item[];
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
    const session = useSession();

    const loadItems = async () => {
        setNoItems(false);
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
                setItems(prev => [...prev, item]);
            }
        })
    }

    useEffect(() => {
        if(session?.session){
            loadItems();
        }
    }, [session?.session])

    return(
        <ItemContext.Provider value = {{
            items : items,
            refreshItems : async () => await loadItems(),
            noItems : noItems,
        }}>
            {children}
        </ItemContext.Provider>
    )
}
