import { Helmet } from "react-helmet-async";

interface OrganizationSchemaProps {
  name: string;
  url: string;
  logo?: string;
  description: string;
}

export const OrganizationSchema = ({ name, url, logo, description }: OrganizationSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name,
    url,
    ...(logo && { logo }),
    description,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Support",
      email: "support@cakeaiartist.com"
    },
    areaServed: [
      { "@type": "Country", "name": "United States" },
      { "@type": "Country", "name": "Canada" },
      { "@type": "Country", "name": "United Kingdom" },
      { "@type": "Country", "name": "Australia" }
    ]
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// SoftwareApplication Schema for international search visibility
export const SoftwareApplicationSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Cake AI Artist",
    "applicationCategory": "DesignApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free tier available with premium options"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "2847",
      "bestRating": "5",
      "worstRating": "1"
    },
    "availableCountry": ["US", "CA", "GB", "AU"],
    "description": "AI-powered cake designer for creating personalized celebration cakes. Design beautiful birthday, anniversary, and party cakes in seconds.",
    "url": "https://cakeaiartist.com"
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

interface WebSiteSchemaProps {
  name: string;
  url: string;
}

export const WebSiteSchema = ({ name, url }: WebSiteSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

interface ProductSchemaProps {
  name: string;
  description: string;
  price: string;
  priceCurrency: string;
  availability: string;
  url: string;
}

export const ProductSchema = ({ name, description, price, priceCurrency, availability, url }: ProductSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    url,
    offers: {
      "@type": "Offer",
      price,
      priceCurrency,
      availability: `https://schema.org/${availability}`,
      url
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

interface FAQSchemaProps {
  faqs: Array<{
    question: string;
    answer: string;
  }>;
}

export const FAQSchema = ({ faqs }: FAQSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(faq => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

interface ArticleSchemaProps {
  headline: string;
  description: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  url: string;
  image?: string;
}

export const ArticleSchema = ({ headline, description, datePublished, dateModified, author, url, image }: ArticleSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Person",
      name: author
    },
    publisher: {
      "@type": "Organization",
      name: "Cake AI Artist",
      logo: {
        "@type": "ImageObject",
        url: "https://cakeaiartist.com/logo.png"
      }
    },
    url,
    ...(image && {
      image: {
        "@type": "ImageObject",
        url: image
      }
    })
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

interface LocalBusinessSchemaProps {
  name: string;
  url: string;
  email: string;
}

export const LocalBusinessSchema = ({ name, url, email }: LocalBusinessSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    url,
    email
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

export const BreadcrumbSchema = ({ items }: BreadcrumbSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

interface AggregateRatingSchemaProps {
  itemName: string;
  ratingValue: number;
  ratingCount: number;
  reviewCount: number;
  bestRating?: number;
  worstRating?: number;
}

export const AggregateRatingSchema = ({ 
  itemName, 
  ratingValue, 
  ratingCount, 
  reviewCount,
  bestRating = 5,
  worstRating = 1
}: AggregateRatingSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: itemName,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: ratingValue.toString(),
      ratingCount: ratingCount.toString(),
      reviewCount: reviewCount.toString(),
      bestRating: bestRating.toString(),
      worstRating: worstRating.toString()
    }
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

interface ReviewItem {
  author: string;
  reviewBody: string;
  ratingValue: number;
  datePublished?: string;
}

interface ReviewSchemaProps {
  itemName: string;
  reviews: ReviewItem[];
}

export const ReviewSchema = ({ itemName, reviews }: ReviewSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: itemName,
    review: reviews.map(review => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.author
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.ratingValue.toString(),
        bestRating: "5",
        worstRating: "1"
      },
      reviewBody: review.reviewBody,
      datePublished: review.datePublished || new Date().toISOString().split('T')[0]
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// Combined Product + Reviews + AggregateRating schema (fixes Google Search Console error)
interface ProductReviewSchemaProps {
  itemName: string;
  description?: string;
  url?: string;
  ratingValue: number;
  ratingCount: number;
  reviewCount: number;
  reviews: ReviewItem[];
}

export const ProductReviewSchema = ({ 
  itemName, 
  description,
  url,
  ratingValue, 
  ratingCount, 
  reviewCount,
  reviews 
}: ProductReviewSchemaProps) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: itemName,
    ...(description && { description }),
    ...(url && { url }),
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: ratingValue.toString(),
      ratingCount: ratingCount.toString(),
      reviewCount: reviewCount.toString(),
      bestRating: "5",
      worstRating: "1"
    },
    review: reviews.map(review => ({
      "@type": "Review",
      author: {
        "@type": "Person",
        name: review.author
      },
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.ratingValue.toString(),
        bestRating: "5",
        worstRating: "1"
      },
      reviewBody: review.reviewBody,
      datePublished: review.datePublished || new Date().toISOString().split('T')[0]
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};
