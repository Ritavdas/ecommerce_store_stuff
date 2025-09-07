import { NextRequest, NextResponse } from 'next/server';
import { getCart, updateCart } from '@/lib/store';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { cartId: string; productId: string } }
) {
  try {
    const { cartId, productId } = params;

    if (!cartId || !productId) {
      return NextResponse.json(
        createErrorResponse('Cart ID and Product ID are required', 'MISSING_IDS'),
        { status: 400 }
      );
    }

    const cart = getCart(cartId);
    if (!cart) {
      return NextResponse.json(
        createErrorResponse('Cart not found', 'CART_NOT_FOUND'),
        { status: 404 }
      );
    }

    const itemIndex = cart.items.findIndex(item => item.productId === productId);
    if (itemIndex === -1) {
      return NextResponse.json(
        createErrorResponse('Item not found in cart', 'ITEM_NOT_FOUND'),
        { status: 404 }
      );
    }

    cart.items.splice(itemIndex, 1);
    const updatedCart = updateCart(cart);
    
    return NextResponse.json(createSuccessResponse({ cart: updatedCart }));
  } catch (error) {
    console.error('Error removing item from cart:', error);
    return NextResponse.json(
      createErrorResponse('Failed to remove item from cart', 'REMOVE_FROM_CART_ERROR'),
      { status: 500 }
    );
  }
}