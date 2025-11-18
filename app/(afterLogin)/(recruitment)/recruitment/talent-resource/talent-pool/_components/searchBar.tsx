'user client';

import { Input } from 'antd';
import { AiOutlineSearch } from 'react-icons/ai';

export default function SearchBar() {
  return (
    <Input.Search
      id="talent-acquisition-talent-pool-search-bar"
      data-cy="talent-acquisition-talent-pool-search-bar"
      placeholder="Search what you need"
      prefix={<AiOutlineSearch className="text-gray-400" />}
      className="w-1/3"
    />
  );
}
