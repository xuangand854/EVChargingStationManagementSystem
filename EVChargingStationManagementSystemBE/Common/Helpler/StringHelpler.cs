﻿namespace Common.Helpler
{
    public static class StringHelpler
    {
        public static bool HasValue(this string? str)
        {
            return !string.IsNullOrWhiteSpace(str);
        }
    }
}
