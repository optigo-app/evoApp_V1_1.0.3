import React from 'react';
import './CartCard.scss';
import { Card, Typography, IconButton, Box } from '@mui/material';
import { Printer, Trash2 } from 'lucide-react';
import PlaceHolderImg from '../../assests/placeHolderImg.svg';

const CartCard = ({ cartItem, handleOpenDialog }) => {
  return (
    <Card className="Cart-card">
      <Box className="card-content">
        <div style={{ width: '25%' }}>
          <img
            src={cartItem?.CDNDesignImageFol + cartItem?.ImageName}
            alt={cartItem?.TitalLine}
            className="product-image"
            loading="lazy"
            onError={(e) => (e.target.src = PlaceHolderImg)}
          />
        </div>

        <Box className="product-details">
          <Box className="product-id">
            <Typography className="itemCode">
              {cartItem?.DesignNo} ({cartItem?.JobNo})
            </Typography>
            {cartItem?.StockId && <span className="status-dot" />}
          </Box>

          <Typography variant="subtitle1" className="product-title">
            {cartItem?.TitalLine}
          </Typography>

          <Box className="price-section">
            <Box className="extra-price-details">
              {parseFloat(cartItem?.DiscountAmount) > 0 && (
                <Typography className="discount-amount" style={{ display: 'flex' }}>
                  Offered Price: {" "}
                  <p style={{ margin: "0px 2px", fontSize: "12px", width: '9px' }}>
                    {" "}₹
                  </p>
                  {parseFloat(cartItem?.TaxbleAmount).toFixed(0).toLocaleString()}
                </Typography>
              )}
            </Box>
            <Typography className={cartItem?.Discount === 0 ? "old-price-withoutdiscount" : "old-price"} style={{ display: 'flex' }}>
              <p style={{ margin: "0px", fontSize: "12px", width: '9px' }}>
                ₹
              </p>
              {parseFloat(cartItem?.Amount).toFixed(0).toLocaleString()}
            </Typography>
          </Box>

          <Box className="price-section">
            {cartItem?.Discount !== 0 &&
              (
                cartItem?.DiscountOnId == 0 ? (
                  <Typography className="newprice_save">
                    Save {parseFloat(cartItem?.Discount).toFixed(2).toLocaleString()}%
                  </Typography>)
                  : (
                    <Typography className="newprice_save" style={{ display: 'flex' }}>
                      Save{" "}
                      <p style={{ margin: "0px 0px 0px 2px", fontSize: "12px", color: 'green', width: '9px' }}>
                        ₹
                      </p>
                      {" "}{parseFloat(cartItem?.DiscountAmount).toFixed(0).toLocaleString()}
                    </Typography>
                  ))}
          </Box>

          <Box className="price-section">
            <Typography className="new-price" style={{ display: 'flex' }}>
              <p style={{ margin: "0px", width: '9px', color: "#5e08b6", fontSize: '13px' }}>
                ₹
              </p>
              {" "}{parseFloat(cartItem?.FinalAmount).toFixed(0).toLocaleString()}
            </Typography>
            {parseFloat(cartItem?.TotalTaxAmount) > 0 && (
              <Typography className="tax-amount" style={{ display: 'flex' }}>
                (Inc.Tax:              <p style={{ margin: "0px", fontSize: '11px', width: '7px' }}>

                  ₹
                </p>
                {" "}{parseFloat(cartItem?.TotalTaxAmount).toFixed(0).toLocaleString()})
              </Typography>
            )}
          </Box>
          <Box className="actions">
            <IconButton onClick={() => handleOpenDialog(cartItem, 'single')}>
              <Trash2 className="btn" />
            </IconButton>
            {/* <IconButton onClick={() => handlePrint(cartItem)}>
              <Printer className="btn" />
            </IconButton> */}
          </Box>
        </Box>
      </Box>
    </Card>
  );
};

export default CartCard;
