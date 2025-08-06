import { fetchAuthSession } from 'aws-amplify/auth';

interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: Record<string, string | number | boolean | null | undefined>;
  headers?: Record<string, string>;
  baseURL?: string;
}

const DEFAULT_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';


export const apiClient = {
  async request<T = unknown>(
    endpoint: string, 
    options: ApiRequestOptions = {}
  ): Promise<T> {
    try {
      // Get the access token from Cognito
      const session = await fetchAuthSession();
      const accessToken = session.tokens?.accessToken?.toString();

      if (!accessToken) {
        throw new Error('No access token available. User must be authenticated.');
      }

      const {
        method = 'GET',
        body,
        headers = {},
        baseURL = DEFAULT_BASE_URL,
      } = options;

      // Build the complete url
      const url = `${baseURL}${endpoint}`;

      const requestHeaders = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        ...headers,
      };

      const requestOptions: RequestInit = {
        method,
        headers: requestHeaders,
      };

      if (body && method !== 'GET') {
        requestOptions.body = JSON.stringify(body);
      }

      console.log(`Making ${method} request to: ${url}`);
      //console.log('Headers:', requestHeaders);

      const response = await fetch(url, requestOptions);

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        let errorMessage = `Error en la petición: ${response.status}`;
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson && errorJson.message) {
            errorMessage = errorJson.message;
          }
        } catch (e) {
          // No es JSON, usar texto plano
          errorMessage = errorText;
        }
        // Handle different error codes
        if (response.status === 401) {
          throw new Error('Token de acceso inválido o expirado');
        } else if (response.status === 403) {
          throw new Error('No tienes permisos para acceder a este recurso');
        } else if (response.status === 404) {
          throw new Error('Recurso no encontrado');
        } else if (response.status >= 500) {
          throw new Error('Error interno del servidor');
        } else {
          throw new Error(errorMessage);
        }
      }

      // Try to parse the response as JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text() as T;
      }
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  },

  // Convenience methods for different types of requests
  get: <T = unknown>(endpoint: string, headers?: Record<string, string>, baseURL?: string) =>
    apiClient.request<T>(endpoint, { method: 'GET', headers, baseURL }),

  post: <T = unknown>(endpoint: string, body: Record<string, string | number | boolean | null | undefined>, headers?: Record<string, string>, baseURL?: string) =>
    apiClient.request<T>(endpoint, { method: 'POST', body, headers, baseURL }),

  put: <T = unknown>(endpoint: string, body: Record<string, string | number | boolean | null | undefined>, headers?: Record<string, string>, baseURL?: string) =>
    apiClient.request<T>(endpoint, { method: 'PUT', body, headers, baseURL }),

  delete: <T = unknown>(endpoint: string, headers?: Record<string, string>, baseURL?: string) =>
    apiClient.request<T>(endpoint, { method: 'DELETE', headers, baseURL }),

  patch: <T = unknown>(endpoint: string, body: Record<string, string | number | boolean | null | undefined>, headers?: Record<string, string>, baseURL?: string) =>
    apiClient.request<T>(endpoint, { method: 'PATCH', body, headers, baseURL }),

  // Method for requests without authentication (if necessary)
  requestWithoutAuth: async <T = unknown>(
    endpoint: string, 
    options: Omit<ApiRequestOptions, 'baseURL'> & { baseURL?: string } = {}
  ): Promise<T> => {
    const {
      method = 'GET',
      body,
      headers = {},
      baseURL = DEFAULT_BASE_URL,
    } = options;

    const url = `${baseURL}${endpoint}`;

    const requestHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error en la petición: ${response.status} - ${errorText}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text() as T;
    }
  },
};

export const nestApiClient = {
  // endpoints de la api nestjs
  users: {
    getAll: () => apiClient.get('/users'),
    create: (userData: Record<string, string | number | boolean | null | undefined>) => apiClient.post('/users', userData),
  },
  geo: {
    getAddress: (houseNumber: string, street: string, borough: string, zip: string) => apiClient.get(`/geo-client/address?houseNumber=${houseNumber}&street=${street}&borough=${borough}&zip=${zip}`),
    getAddressUser: (data: {houseNumber: string, street: string, borough: string, zip: string}) => apiClient.post('/geo-client/address/user', data),
  },
  calculations: {
    calculate: (data: {houseNumber: string, street: string, borough: string, address: string}) => apiClient.post('/calculations', data),
    getCalculations: () => apiClient.get('/calculations/user'),
    getCalculation: (calculationId: string) => apiClient.get(`/calculations/${calculationId}`),
    updateCalculation: (calculationId: string, data: Record<string, string | number | boolean | null | undefined>) => apiClient.put(`/calculations/${calculationId}`, data),
  },
}; 
