import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { Button } from './ui/button';

type Testimonial = {
  id: number;
  name: string;
  course: string | null;
  content: string;
  image: string | null;
  rating: number | null;
};

type TestimonialsCarouselProps = {
  testimonials: Testimonial[];
};

export default function TestimonialsCarousel({ testimonials }: TestimonialsCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start' },
    [Autoplay({ delay: 5000, stopOnInteraction: false })]
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi, onSelect]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="flex-[0_0_100%] min-w-0 md:flex-[0_0_50%] lg:flex-[0_0_33.333%] px-4">
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 h-full relative">
                <Quote className="absolute top-4 right-4 w-12 h-12 text-secondary/10" />
                
                <div className="flex items-center gap-4 mb-6">
                  {testimonial.image ? (
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-secondary shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-2xl shadow-md">
                      {testimonial.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-lg text-primary">{testimonial.name}</h4>
                    {testimonial.course && (
                      <p className="text-sm text-muted-foreground">{testimonial.course}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-1 mb-4">
                  {renderStars(testimonial.rating || 5)}
                </div>

                <p className="text-muted-foreground leading-relaxed italic">
                  "{testimonial.content}"
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-4 mt-8">
        <Button
          variant="outline"
          size="icon"
          onClick={scrollPrev}
          className="rounded-full border-primary/20 hover:bg-primary hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={scrollNext}
          className="rounded-full border-primary/20 hover:bg-primary hover:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mt-4">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === selectedIndex
                ? 'bg-primary w-8'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Ir para depoimento ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
