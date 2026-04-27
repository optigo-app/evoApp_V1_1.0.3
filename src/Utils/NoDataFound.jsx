import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { Heart, ShoppingCart, Search } from "lucide-react";

const iconMap = {
    wishlist: <Heart size={48} color="#808080" />,
    cart: <ShoppingCart size={48} color="#808080" />,
    notfound: <Search size={48} color="#808080" />,
};

const messageMap = {
    wishlist: "No Wishlist Found",
    cart: "Your Cart is Empty",
    notfound: "Nothing Found",
};

const descriptionMap = {
    wishlist: "Save items you love and view them anytime.",
    cart: "Looks like your cart is empty. Let's add some items!",
    notfound: "Try adjusting your filters or search.",
};

const NoDataFoundMobile = ({
    type = "notfound",
    customMessage,
    customDescription,
}) => {
    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight="60%"
            px={3}
            py={6}
            textAlign="center"
            sx={{
                backgroundColor: "#fff",
                borderRadius: 2,
            }}
        >
            {iconMap[type]}
            <Typography variant="h6" mt={2} fontWeight={600}>
                {customMessage || messageMap[type]}
            </Typography>
            <Typography
                variant="body2"
                mt={1}
                mb={3}
                sx={{ maxWidth: 300, color: '#808080 !important' }}
            >
                {customDescription || descriptionMap[type]}
            </Typography>
        </Box>
    );
};

export default NoDataFoundMobile;
