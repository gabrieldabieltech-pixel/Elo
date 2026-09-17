"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-6 bg-app-bg">
      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="flex flex-col items-center gap-4 pb-2">
          <Image
            src="/elo-logo-horizontal.png"
            alt="Elo"
            width={120}
            height={36}
            className="h-8 w-auto"
            priority
          />
          <CardTitle className="text-xl text-primary font-[family-name:var(--font-display)]">Acesso ao Painel</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuário</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full"
              />
            </div>
            {error && <p className="text-sm text-danger font-medium text-center">{error}</p>}
            <Button type="submit" className="w-full mt-2" disabled={loading}>
              {loading ? "Entrando..." : "Entrar no Sistema"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
