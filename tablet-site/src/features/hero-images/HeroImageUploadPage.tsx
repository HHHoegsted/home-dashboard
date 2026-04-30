import { FormEvent, useEffect, useMemo, useState } from "react";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";

import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { getApiBaseUrl } from "../../lib/apiBaseUrl";

type HeroImage = {
  name: string;
  url: string;
  sizeBytes: number;
  isBirthday: boolean;
};

function getAbsoluteImageUrl(url: string): string {
  return `${getApiBaseUrl()}${url}`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function HeroImageUploadPage() {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [password, setPassword] = useState("");
  const [title, setTitle] = useState("");
  const [birthdayName, setBirthdayName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedPreviewUrl = useMemo(() => {
    if (!selectedFile) {
      return null;
    }

    return URL.createObjectURL(selectedFile);
  }, [selectedFile]);

  useEffect(() => {
    void loadImages();
  }, []);

  useEffect(() => {
    return () => {
      if (selectedPreviewUrl) {
        URL.revokeObjectURL(selectedPreviewUrl);
      }
    };
  }, [selectedPreviewUrl]);

  async function loadImages() {
    const apiBaseUrl = getApiBaseUrl();
    const response = await fetch(`${apiBaseUrl}/api/hero-images`);
    const data: { images: HeroImage[] } = await response.json();
    setImages(data.images);
  }

  async function uploadImage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedFile) {
      setMessage("Vælg et billede først.");
      return;
    }

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    const apiBaseUrl = getApiBaseUrl();
    formData.append("password", password);
    formData.append("image", selectedFile);
    formData.append("title", title);
    formData.append("birthdayName", birthdayName);

    try {
      const response = await fetch(`${apiBaseUrl}/api/hero-images`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail ?? "Upload fejlede.");
      }

      setSelectedFile(null);
      setTitle("");
      setBirthdayName("");
      setMessage("Billedet er uploadet.");
      await loadImages();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Upload fejlede."
      );
    } finally {
      setLoading(false);
    }
  }

  async function deleteImage(image: HeroImage) {
    if (!password) {
      setMessage("Indtast adgangskoden først.");
      return;
    }

    const formData = new FormData();
    const apiBaseUrl = getApiBaseUrl();
    formData.append("password", password);

    const response = await fetch(
      `${apiBaseUrl}/api/hero-images/${encodeURIComponent(image.name)}`,
      {
        method: "DELETE",
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.json();
      setMessage(error.detail ?? "Kunne ikke slette billedet.");
      return;
    }

    setMessage("Billedet er slettet.");
    await loadImages();
  }

  return (
    <div className="min-h-screen text-white">
      <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-5 p-4 md:p-8">
        <header>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.22em] text-white/70">
            <ImagePlus className="h-4 w-4" />
            Hero billeder
          </div>

          <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
            Upload til dashboardet
          </h1>
        </header>

        <Card>
          <CardContent className="p-5 md:p-6">
            <form className="grid gap-4" onSubmit={uploadImage}>
              <label className="grid gap-2 text-sm text-white/70">
                Adgangskode
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  autoComplete="current-password"
                  className="min-h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-base text-white outline-none transition focus:border-white/30"
                />
              </label>

              <label className="grid gap-2 text-sm text-white/70">
                Billede
                <input
                  onChange={(event) =>
                    setSelectedFile(event.target.files?.[0] ?? null)
                  }
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="min-h-12 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-base text-white file:mr-4 file:rounded-xl file:border-0 file:bg-white/15 file:px-3 file:py-2 file:text-white"
                />
              </label>

              {selectedPreviewUrl ? (
                <div className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
                  <img
                    src={selectedPreviewUrl}
                    alt=""
                    className="h-64 w-full object-cover"
                  />
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2 text-sm text-white/70">
                  Titel
                  <input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="sommer-i-haven"
                    className="min-h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-base text-white outline-none transition placeholder:text-white/35 focus:border-white/30"
                  />
                </label>

                <label className="grid gap-2 text-sm text-white/70">
                  Fødselsdag
                  <input
                    value={birthdayName}
                    onChange={(event) => setBirthdayName(event.target.value)}
                    placeholder="Charlie"
                    className="min-h-12 rounded-2xl border border-white/10 bg-black/20 px-4 text-base text-white outline-none transition placeholder:text-white/35 focus:border-white/30"
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="submit"
                  disabled={loading}
                  className="min-h-12 rounded-2xl bg-white px-5 text-slate-950 hover:bg-white/90"
                >
                  {loading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Upload
                </Button>

                {message ? (
                  <div className="text-sm text-white/70">{message}</div>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <section className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <article
              key={image.name}
              className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.06]"
            >
              <img
                src={getAbsoluteImageUrl(image.url)}
                alt=""
                className="h-44 w-full object-cover"
              />

              <div className="grid gap-3 p-4">
                <div className="min-w-0">
                  <div className="truncate font-medium">{image.name}</div>
                  <div className="mt-1 text-sm text-white/55">
                    {formatBytes(image.sizeBytes)}
                    {image.isBirthday ? " · fødselsdag" : ""}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => void deleteImage(image)}
                  className="justify-self-start rounded-2xl text-white/75 hover:bg-white/10 hover:text-white"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Slet
                </Button>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
