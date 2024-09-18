"use client";

import {
  Code,
  Input,
  Button
} from "@nextui-org/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon, UserIcon, KeyIcon } from "@heroicons/react/24/solid";
import Cookies from "js-cookie";
import api from "@/app/axios";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const router = useRouter();

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Por favor, complete todos los campos.");
      return;
    }

    try {
      const response = await api.post("/users/login/", {
        username,
        password
      });

      const { user, access_token } = response.data;
      Cookies.set("user", JSON.stringify(user));
      Cookies.set("access_token", access_token);

      if (Cookies.get("user") && Cookies.get("access_token")) {
        router.push("/dashboard");
      } else {
        setError("Ha ocurrido un error al iniciar sesión.");
      }
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div className='container mx-auto grid max-w-lg p-4 border rounded-2xl m-4 mt-32 bg-white'>
      <p className="text-center text-2xl basis-full font-bold">Iniciar sesión</p>
      {error && <Code color='danger' className='text-wrap'>{error}</Code>}
      <form className="flex flex-col gap-2 mt-2">
        <Input
          label="Nombre de usuario"
          placeholder="Nombre de usuario"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          startContent={
            <div className="pointer-events-none flex items-center">
              <UserIcon className="h-5 text-default-500" />
            </div>
          }
        />
        <Input
          type={isVisible ? "text" : "password"}
          label='Contraseña'
          placeholder='********'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='mt-2'
          startContent={
            <div className="pointer-events-none flex items-center">
              <KeyIcon className="h-5 text-default-500" />
            </div>
          }
          endContent={
            <Button isIconOnly size='sm' variant='light' className="focus:outline-none" type="button" onClick={toggleVisibility} aria-label="toggle password visibility">
              {isVisible ? (
                <EyeSlashIcon className="h-6 text-default-400 pointer-events-none" />
              ) : (
                <EyeIcon className="h-6 text-default-400 pointer-events-none" />
              )}
            </Button>
          }
        />
        <Button
          onClick={handleLogin}
          className='mt-2 font-bold text-white'
          color='primary'
        >
          Iniciar sesión
        </Button>
      </form>
    </div>
  );
}