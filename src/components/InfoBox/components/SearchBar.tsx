import { useState } from "react";

interface SearchProps {
  items: any[];
  filter: Function;
}

export default function SearchBar(props: SearchProps) {
  const [input, changeInput] = useState<string>("");

  const month = ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "Oktober", "November", "December"];
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

        if (key == "firstName" && item["lastName"] != undefined) {
          let temp1 = item["firstName"] + " " + item["lastName"];
          let temp2 = item["lastName"] + " " + item["firstName"];
          if (check(temp1, item, value) || check(temp2, item, value)) matches.push(item);
        }
      }
    });

    props.filter(matches);
  }

  //props.filter(matches);

  return (
    <div className="flex focus:ring-2 border-2 border-black ">
      <div className="mr-1">🔎</div>
      <input className="center" placeholder="Search" onChange={(e) => filter(e.target.value)}></input>
    </div>
  );
}
