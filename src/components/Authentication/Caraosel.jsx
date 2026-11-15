import { Box, Text } from "@chakra-ui/react";
import Slider from "react-slick";

// ✅ Import slick styles
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const texts = [
  {
    text1: "One Platform to Simplify All HR Operations",
    text2:
      "From onboarding to payroll, manage everything in one seamless powerful dashboard.",
  },
  {
    text1: "Powerful Dashboard for HR Teams",
    text2:
      "From onboarding to payroll, manage everything in one seamless powerful dashboard.",
  },
  {
    text1: "Automated Payroll System",
    text2:
      "From onboarding to payroll, manage everything in one seamless powerful dashboard.",
  },
];

// Carousel component need to start after testing
export default function Carousel() {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <Box w="70%" mx="auto" mt="-10px" textAlign="center" fontFamily={"Poppins"}>
      <Slider {...settings}>
        {texts.map((src, i) => (
          <Box key={i} py={4}>
            <Text
              fontFamily="Poppins"
              fontWeight="600"
              fontSize="14px"
              lineHeight="100%"
              letterSpacing="-0.03em"
              textAlign="center"
              mb={2}
              color="#0a0a0a"
            >
              {src.text1}
            </Text>
            <Text
              fontFamily="Poppins"
              fontWeight="400"
              fontStyle="normal"
              fontSize="12px"
              lineHeight="16px"
              letterSpacing="-0.03em"
              textAlign="center"
              color="#757575"
            >
              {src.text2}
            </Text>
          </Box>
        ))}
      </Slider>

      {/* ✅ Slick Dots Override */}
      <style>{`
        .slick-dots {
          bottom: -15px;
          display: flex !important;
          justify-content: center;
        }
        .slick-dots li {
          margin: -12px -2px !important;
        }
        .slick-dots li button {
          width: 2px;
          height: 2px;
          padding: 0;
        }
        .slick-dots li button:before {
          font-size: 6px;
          color: #c2c2c2;
          opacity: 1;
        }
        .slick-dots li.slick-active button:before {
          color: #000000;
          opacity: 1;
        }
      `}</style>
    </Box>
  );
}
