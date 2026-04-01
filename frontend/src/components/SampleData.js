'use client';

import { Database } from 'lucide-react';

const sampleCSV = `Product,Category,Price,Quantity,Date,City,Rating
Laptop,Electronics,999.99,150,2024-01-15,New York,4.5
Phone,Electronics,699.99,300,2024-01-20,Los Angeles,4.2
Desk,Furniture,249.99,80,2024-02-01,Chicago,3.8
Chair,Furniture,189.99,120,2024-02-10,Houston,4.0
Headphones,Electronics,149.99,500,2024-02-15,Phoenix,4.7
Bookshelf,Furniture,129.99,60,2024-03-01,New York,3.5
Tablet,Electronics,449.99,200,2024-03-10,Los Angeles,4.3
Monitor,Electronics,349.99,175,2024-03-15,Chicago,4.6
Sofa,Furniture,599.99,40,2024-04-01,Houston,4.1
Keyboard,Electronics,79.99,600,2024-04-10,Phoenix,4.4
Mouse,Electronics,29.99,800,2024-04-15,New York,4.3
Lamp,Furniture,49.99,200,2024-05-01,Los Angeles,3.9
TV,Electronics,1299.99,90,2024-05-10,Chicago,4.8
Rug,Furniture,199.99,110,2024-05-15,Houston,3.7
Webcam,Electronics,89.99,350,2024-06-01,Phoenix,4.1
Dresser,Furniture,399.99,55,2024-06-10,New York,4.0
Speaker,Electronics,199.99,250,2024-06-15,Los Angeles,4.5
Mattress,Furniture,799.99,30,2024-07-01,Chicago,4.4
Charger,Electronics,24.99,900,2024-07-10,Houston,4.2
Mirror,Furniture,149.99,75,2024-07-15,Phoenix,3.6`;

export default function SampleData({ onLoadSample }) {
  
  const handleClick = () => {
    // Create a File object from our sample CSV string
    const blob = new Blob([sampleCSV], { type: 'text/csv' });
    const file = new File([blob], 'sample_sales_data.csv', { type: 'text/csv' });
    onLoadSample(file);
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 text-sm text-gray-400 
                 hover:text-fuchsia-500 transition-colors mx-auto mt-4
                 border border-gray-300 hover:border-fuchsia-500 
                 px-4 py-2 rounded-lg"
    >
      <Database size={14} />
      Try with sample data
    </button>
  );
}