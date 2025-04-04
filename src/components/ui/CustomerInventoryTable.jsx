// src/app/customerdashboard/components/CustomerInventoryTable.jsx
'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

export default function CustomerInventoryTable({ filteredData }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <Table>
        <TableHeader className="bg-purple-50">
          <TableRow>
            <TableHead className="text-purple-800">Product</TableHead>
            <TableHead className="text-purple-800">Category</TableHead>
            <TableHead className="text-purple-800">Price</TableHead>
            <TableHead className="text-purple-800">Availability</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.map((item) => (
            <TableRow key={item.id} className="hover:bg-purple-50/50 transition-colors">
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.price}</TableCell>
              <TableCell>
                <Badge
                  variant={item.stock > 0 ? 'default' : 'destructive'}
                  className="capitalize"
                >
                  {item.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}