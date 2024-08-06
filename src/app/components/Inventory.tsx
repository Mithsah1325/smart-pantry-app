"use client";

import React, { useState, useEffect } from 'react';
import { IoIosAddCircle } from 'react-icons/io';
import { FaRegEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

import { firestore } from '../firebaseConfig'; // Import your Firebase configuration
import { collection, doc, getDoc, getDocs, query, setDoc, deleteDoc } from 'firebase/firestore';

// Define the Item interface
interface Item {
  name: string;
  quantity: number;
  price: number;
}

const Inventory: React.FC = () => {
  // State variables to track input values and list of items
  const [itemName, setItemName] = useState<string>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [price, setPrice] = useState<number | ''>('');
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchTermChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Function to fetch inventory data from Firestore
  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList: Item[] = [];
    docs.forEach((doc) => {
      const data = doc.data();
      inventoryList.push({ name: doc.id, quantity: data.quantity, price: data.price });
    });
    setItems(inventoryList);
  };

  useEffect(() => {
    updateInventory();
  }, []);

  // Function to add or update an item in the inventory
  const addItem = async (item: Item) => {
    const docRef = doc(collection(firestore, 'inventory'), item.name);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      await setDoc(docRef, { quantity: quantity + item.quantity, price: item.price });
    } else {
      await setDoc(docRef, { quantity: item.quantity, price: item.price });
    }
    await updateInventory();
  };

  // Function to remove an item from the inventory
  const removeItem = async (item: Item) => {
    const docRef = doc(collection(firestore, 'inventory'), item.name);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { quantity } = docSnap.data();
      if (quantity <= item.quantity) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { quantity: quantity - item.quantity, price: item.price });
      }
    }
    await updateInventory();
  };

  const handleItemNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setItemName(event.target.value);
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(event.target.value === '' ? '' : Number(event.target.value));
  };

  const handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPrice(event.target.value === '' ? '' : Number(event.target.value));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (itemName && quantity !== '' && price !== '') {
      const newItem: Item = { name: itemName, quantity: Number(quantity), price: Number(price) };
      const itemExists = items.some((item) => item.name === itemName);
      
      if (itemExists) {
        // Update item
        await addItem(newItem);
      } else {
        // Add new item
        await addItem(newItem);
      }

      setItemName('');
      setQuantity('');
      setPrice('');
    } else {
      alert('Please fill out all fields.');
    }
  };

  const handleEdit = (item: Item) => {
    // Populate the form fields with the item data for editing
    setItemName(item.name);
    setQuantity(item.quantity);
    setPrice(item.price);
  };

  const handleDelete = async (item: Item) => {
    // Confirm before deleting
    if (window.confirm(`Are you sure you want to delete ${item.name}?`)) {
      await removeItem(item);
      setItems(items.filter((i) => i.name !== item.name)); // Update the local state
    }
  };

  // Filter items based on search term
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <h1 className="text-center text-4xl font-semibold text-gray-800 mb-6">Smart Inventory App</h1>
      <div className="flex items-center mb-6 max-w-md mx-auto">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchTermChange}
          className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-5/12"
          placeholder="Search Items"
        />
      </div>
      <form
        className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col space-y-4">
          <input
            type="text"
            value={itemName}
            onChange={handleItemNameChange}
            className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Item Name"
          />
          <input
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Qty"
          />
          <input
            type="number"
            value={price}
            onChange={handlePriceChange}
            className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Price"
          />
          <button
            type="submit"
            className="flex items-center justify-center bg-blue-500 text-white text-2xl p-3 rounded-md hover:bg-blue-600 transition-colors"
          >
            <IoIosAddCircle />
            <span className="ml-2">Add Item</span>
          </button>
        </div>
      </form>

      {/* Display the list of items */}
      {filteredItems.length > 0 && (
        <div className="mt-8 max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Item List</h2>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-semibold text-gray-700">Item</th>
                <th className="text-left p-2 font-semibold text-gray-700">Qty</th>
                <th className="text-left p-2 font-semibold text-gray-700">Price</th>
                <th className="text-left p-2 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2 text-gray-600">{item.name}</td>
                  <td className="p-2 text-gray-600">{item.quantity}</td>
                  <td className="p-2 text-gray-600">${item.price.toFixed(2)}</td>
                  <td className="p-2 text-gray-600">
                    <button
                      onClick={() => handleEdit(item)}
                      className="text-blue-500 hover:underline mr-2"
                    >
                      <FaRegEdit className='text-2xl mr-2'/>
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="text-red-500 hover:underline"
                    >
                      <MdDelete className='text-2xl'/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
};

export default Inventory;
