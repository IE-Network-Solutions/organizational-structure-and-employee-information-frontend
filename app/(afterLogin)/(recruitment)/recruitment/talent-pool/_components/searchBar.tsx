'user client';

import { Input } from 'antd';
import { AiOutlineSearch } from 'react-icons/ai';

export default function SearchBar() {
  return (
    <Input.Search
      placeholder="Search what you need"
      prefix={<AiOutlineSearch className="text-gray-400" />}
      className="w-1/3"
    />
  );
}
