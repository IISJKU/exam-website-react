import { ChangeEventHandler, HTMLInputTypeAttribute } from "react";

interface FormFieldProps {
  label: String;
  id: HTMLInputTypeAttribute;
  type: HTMLInputTypeAttribute;
  value: HTMLInputTypeAttribute;
  onChange: ChangeEventHandler;
  errorText?: string;
}

export default function FormField(props: FormFieldProps) {
  return (
    <div className="p-5 w-full">
      <div>
        <label htmlFor={props.id} className="block mb-2 text-xl font-medium text-gray-900">
          {props.label}*
        </label>
        <input
          type={props.type}
          id={props.id}
          value={props.value}
          onChange={props.onChange}
          className="
                  bg-gray-50 border border-slate-900 text-gray-900 text-sm 
                  focus:ring-4 ring-offset-2 
                  focus:ring-blue-600
                  block p-2.5
                  text-xl
                  
                  w-full 2xl:w-1/4 xl:w-1/3 lg:w-3/5 md:w-2/3 sm:w-4/5"
          required
        />
      </div>
      {props.errorText ? <div className="text-red-800 text-xl">{props.errorText}</div> : <></>}
    </div>
  );
}
