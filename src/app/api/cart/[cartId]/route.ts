import { NextRequest, NextResponse } from 'next/server';
import { getCart } from '@/lib/store';
import { createSuccessResponse, createErrorResponse } from '@/lib/utils';

export async function GET(
  _request: NextRequest,
  { params }: { params: { cartId: string } }
) {
  try {
    const { cartId } = params;
    
    if (!cartId) {
      return NextResponse.json(
        createErrorResponse('Cart ID is required', 'MISSING_CART_ID'),
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
    
    return NextResponse.json(createSuccessResponse({ cart }));
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json(
      createErrorResponse('Failed to fetch cart', 'CART_FETCH_ERROR'),
      { status: 500 }
    );
  }
}