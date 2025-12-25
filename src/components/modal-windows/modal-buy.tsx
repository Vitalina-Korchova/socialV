import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { CoinsIcon } from "lucide-react";

interface ModalBuyProps {
  id: number;
  text: string;
  img: string;
  price: number;
  triggerElement: React.ReactNode;
}

export default function ModalBuy({
  id,
  text,
  img,
  price,
  triggerElement,
}: ModalBuyProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleBuy = () => {
    // Додайте логіку купівлі тут
    console.log(`Buying ${text} with id: ${id} for ${price} coins`);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{triggerElement}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Buy {text}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Картинка */}
          <div className="flex justify-center">
            <Image
              src={img}
              alt={text}
              width={200}
              height={200}
              className="h-48 w-48 rounded-lg object-cover border"
            />
          </div>

          {/* Ціна */}
          <div className="flex items-center justify-center gap-2">
            <CoinsIcon className="h-6 w-6 text-yellow-500" />
            <span className="text-3xl font-bold">{price}</span>
            <span className="text-muted-foreground">coins</span>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 gap-2 bg-primary hover:bg-primary/90"
              onClick={handleBuy}
            >
              <CoinsIcon className="h-4 w-4" />
              Buy for {price}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
