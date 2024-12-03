import { useState } from "react";

interface SearchProps {
  items: any[];
  filter: Function;
}

export default function SearchBar(props: SearchProps) {
  const [input, changeInput] = useState<string>("");

  const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let matches: any[] = [];

  function check(key: string, item: object, searchString: string): boolean {
    if (key.toLowerCase().includes(searchString.toLowerCase())) {
      if (!matches.includes(item)) return true;
    }
    return false;
  }

  function filter(value: string) {
    if (value == "" || value == " " || value == undefined) return props.filter(props.items);
    matches = [];
    props.items.forEach((item) => {
      for (const key in item) {
        if (typeof item[key] === "string") {
          if (check(item[key], item, value)) matches.push(item);
        } else if (item[key] instanceof Date) {
          let dateString = item[key].getDate() + " " + month[item[key].getMonth()] + " " + item[key].getFullYear();
          if (check(dateString, item, value)) matches.push(item);
        }

        if (key == "first_name" && item["last_name"] != undefined) {
          let temp1 = item["first_name"] + " " + item["last_name"];
          let temp2 = item["last_name"] + " " + item["first_name"];
          if (check(temp1, item, value) || check(temp2, item, value)) matches.push(item);
        }
      }
    });

    props.filter(matches);
  }

  //props.filter(matches);

  return (
    <div className="relative w-full md:w-2/3 lg:max-w-md">
      <input className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Search..." onChange={(e) => filter(e.target.value)}></input>
      <div aria-hidden="true" className="absolute inset-y-0 right-3 flex items-center text-xl font-bold text-gray-500">🔎</div>
    </div>
  );
}
