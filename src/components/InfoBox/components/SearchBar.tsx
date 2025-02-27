import { useState } from "react";
import { useTranslation } from "react-i18next";

interface SearchProps {
  items: any[];
  filter: Function;
}

export default function SearchBar(props: SearchProps) {
  const { t } = useTranslation();
  const [input, changeInput] = useState<string>("");

  const month = [
    t("January"),
    t("February"),
    t("March"),
    t("April"),
    t("May"),
    t("June"),
    t("July"),
    t("August"),
    t("September"),
    t("October"),
    t("November"),
    t("December"),
  ];
  let matches: any[] = [];

  function check(key: string | number, item: object, searchString: string): boolean {
    const keyString = key.toString().toLowerCase();
    const searchStringLower = searchString.toLowerCase();
    if (keyString.includes(searchStringLower)) {
      if (!matches.includes(item)) return true;
    }
    return false;
  }

  function filter(value: string) {
    changeInput(value);
    if (value === "" || value === " " || value === undefined) {
      props.filter(props.items);
      return;
    }
    matches = [];
    props.items.forEach((item) => {
      for (const key in item) {
        if (typeof item[key] === "string" || typeof item[key] === "number") {
          if (check(item[key], item, value)) matches.push(item);
        } else if (item[key] instanceof Date) {
          const dateString =item[key].getDate() + " " + month[item[key].getMonth()] + " " + item[key].getFullYear();
          if (check(dateString, item, value)) matches.push(item);
        }

        if (key === "first_name" && item["last_name"] !== undefined) {
          const temp1 = item["first_name"] + " " + item["last_name"];
          const temp2 = item["last_name"] + " " + item["first_name"];
          if (check(temp1, item, value) || check(temp2, item, value)) matches.push(item);
        }
      }
    });

    props.filter(matches);
  }

  //props.filter(matches);

  return (
    <div className="relative w-full md:w-2/3 lg:max-w-md">
      <label htmlFor="search-input" className="sr-only">
        {t("Search")}
      </label>
      <input
        id="search-input"
        type="search"
        className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={t("Search...")}
        aria-label={t("Search items")}
        onChange={(e) => filter(e.target.value)}
        value={input}
      />
      <div aria-hidden="true" className="absolute inset-y-0 right-3 flex items-center text-xl font-bold text-gray-500">
        🔎
      </div>
    </div>
  );
}
