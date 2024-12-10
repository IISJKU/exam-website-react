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
  const errorId = `${props.id}-error`; // Generate a unique ID for the error message

  return (
    <div className="p-5 w-full" role="group" aria-labelledby={`${props.id}-label`}>
      <div>
        <label id={`${props.id}-label`} htmlFor={props.id} className="block mb-2 text-xl font-medium text-gray-900">
          {props.label}<span aria-hidden="true">*</span>
        </label>
        <input
          type={props.type}
          id={props.id}
          value={props.value}
          onChange={props.onChange}
          className="
                  bg-gray-50 border border-slate-900 text-gray-900 text-sm 
                  focus:ring-4 ring-offset-2 
                  focus:ring-blue-600 focus:outline-none
                  block p-2.5 text-xl
                  w-full 2xl:w-1/4 xl:w-1/3 lg:w-3/5 md:w-2/3 sm:w-4/5"
          required
          aria-required="true"
          aria-describedby={props.errorText ? errorId : undefined}
        />
      </div>
      {props.errorText && (
        <div id={errorId} className="text-red-800 text-xl" role="alert">
          {props.errorText}
        </div>
      )}
    </div>
  );
}
