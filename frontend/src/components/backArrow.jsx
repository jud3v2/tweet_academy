import React from "react";
import { useNavigate } from "react-router-dom";
import { IoIosArrowBack } from "react-icons/io";

const BackArrow = () => {
  const navigate = useNavigate();
  return (
    <button
      className="flex items-left justify-left w-10 h-10 rounded-full bg-transparent hover:bg-gray-300"
      onClick={(e) => {
        e.preventDefault();
        navigate(-1);
      }}
    >
      <IoIosArrowBack size={24} />
    </button>
  );
};

export default BackArrow;
